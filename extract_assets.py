"""Lossless crops of supplied artwork. No generated or replacement imagery."""
from pathlib import Path
from PIL import Image
from collections import deque
import json

ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'dist/assets'
PAGES = {i: Image.open(ROOT.parent / f'Sample/Page {i}.png').convert('RGB') for i in (1, 2)}
SCALE = 1410 / 1311
manifest = {}

def crop(name, page, box, text=False, circle=False, keyed=False):
    rect = tuple(round(v * SCALE) for v in box)
    im = PAGES[page].crop(rect).convert('RGBA')
    if text:
        # Extract the sample's original yellow/cream letter pixels, including
        # antialiasing. Typography is artwork until the font file is supplied.
        pixels = im.load()
        for y in range(im.height):
            for x in range(im.width):
                r,g,b,a = pixels[x,y]
                alpha = max(0, min(255, (r-232)*16, (g-199)*12, (r-b-72)*10, (g-b-40)*12))
                if name == 'departments-title':
                    alpha = max(0, min(255, (r-210)*8, (g-210)*8, (b-210)*8))
                    pixels[x,y] = (255, 249, 229, alpha)
                else:
                    pixels[x,y] = (255, 229, 147, alpha)
        if name == 'company-tour-label':
            # The source crop includes one row of the photograph's frame.
            # Remove that stray rule while preserving the caption's lettering.
            im.paste((0, 0, 0, 0), (0, 0, im.width, 2))
    if circle:
        from PIL import ImageDraw
        mask = Image.new('L', im.size)
        ImageDraw.Draw(mask).ellipse((0,0,im.width-1,im.height-1),fill=255)
        im.putalpha(mask)
    if keyed:
        pixels=im.load(); bg=pixels[0,0][:3]
        seen=set();q=deque()
        for x in range(im.width):q.extend(((x,0),(x,im.height-1)))
        for y in range(im.height):q.extend(((0,y),(im.width-1,y)))
        while q:
            x,y=q.popleft()
            if not (0<=x<im.width and 0<=y<im.height) or (x,y) in seen:continue
            seen.add((x,y)); r,g,b,a=pixels[x,y]
            if max(abs(r-bg[0]),abs(g-bg[1]),abs(b-bg[2]))>27:continue
            pixels[x,y]=(r,g,b,0)
            q.extend(((x+1,y),(x-1,y),(x,y+1),(x,y-1)))
    im.save(OUT / f'{name}.png', optimize=True)
    manifest[name] = {'page':page,'source_box':rect,'width':im.width,'height':im.height}
    return im

for name,page,box in [
    ('school-title',1,(245,110,1068,199)),
    ('club-title',1,(150,211,1155,338)),
    ('what-title',1,(167,1096,1148,1193)),
    ('internal-title',1,(376,1204,940,1245)),
    ('departments-title',1,(809,650,1052,683)),
    ('external-title',2,(441,106,874,151)),
    ('partner-title',2,(377,552,932,610)),
    ('partner-caption',2,(96,766,1205,805)),
    ('humans-title',2,(445,823,863,884)),
    ('recruitment-title',2,(445,1255,867,1303)),
    ('contact-title',2,(485,1606,827,1659)),
    ('company-tour-label',1,(203,1472,391,1505)),
    ('training-label',1,(493,1474,871,1504)),
    ('marketing-label',1,(882,1473,1201,1505)),
    ('christmas-label',1,(333,1735,658,1769)),
    ('trip-label',1,(816,1736,922,1769)),
    ('bcareer-label',2,(185,476,362,513)),
    ('challengers-label',2,(475,478,833,515)),
    ('logisticom-label',2,(910,475,1165,514)),
]: crop(name,page,box,text=True)

for name,page,box in [
    ('company-tour',1,(123,1275,476,1464)),
    ('business-training',1,(506,1275,853,1464)),
    ('marketing-discussion',1,(885,1275,1194,1464)),
    ('bchristmas',1,(298,1534,648,1725)),
    ('bc-trip',1,(686,1534,1031,1725)),
    ('bcareer',2,(108,209,451,460)),
    ('marketing-challengers',2,(488,210,828,460)),
    ('logisticom',2,(862,209,1203,460)),
    ('induction-qr',2,(336,1318,562,1544)),
    ('cv-qr',2,(776,1318,1002,1544)),
]: crop(name,page,box)

crop('strategic-partner',2,(326,624,990,758),keyed=True)
crop('human-minh-phuong',2,(129,905,410,1196),keyed=True)
crop('human-kim-sa',2,(504,905,803,1196),keyed=True)
crop('human-minh-han',2,(900,905,1177,1196),keyed=True)

crop('bc-logo',1,(116,365,374,627),circle=True)
crop('values',1,(179,650,658,1068),keyed=True)
crop('bcareer-badge',2,(124,170,212,259),circle=True)
crop('marketing-badge',2,(503,170,591,259),circle=True)
crop('logisticom-badge',2,(881,170,970,259),circle=True)

# Keep each heart piece's original outline, lettering and colour. Connected
# components follow the brown puzzle seams, rather than inventing new shapes.
heart = crop('heart-source',1,(724,694,1136,1049))
w,h = heart.size
px=heart.load()
mask=set()
for y in range(h):
    for x in range(w):
        r,g,b,a=px[x,y]
        if g-r*.29>94:
            mask.add((x,y))
components=[]
while mask:
    seed=mask.pop(); q=deque([seed]); component=[seed]
    while q:
        x,y=q.popleft()
        for p in ((x+1,y),(x-1,y),(x,y+1),(x,y-1)):
            if p in mask:
                mask.remove(p);q.append(p);component.append(p)
    if len(component)>1000: components.append(component)
components.sort(key=len,reverse=True)
assert len(components)>=4, 'The four original pieces must be separable.'
for component in components[:4]:
    cx=sum(p[0] for p in component)/len(component)
    cy=sum(p[1] for p in component)/len(component)
    name=('external' if cx<w/2 else 'research') if cy<h*.52 else ('marketing' if cx<w/2 else 'hr')
    piece=Image.new('RGBA',heart.size)
    dest=piece.load()
    for x,y in component: dest[x,y]=px[x,y]
    piece.save(OUT/f'heart-{name}.png',optimize=True)

(OUT/'provenance.json').write_text(json.dumps(manifest,indent=2))
print(f'Extracted {len(manifest)} assets and four original puzzle pieces.')
