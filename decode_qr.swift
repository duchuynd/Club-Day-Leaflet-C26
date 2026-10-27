import Foundation
import Vision
import AppKit
for name in ["induction-qr", "cv-qr"] {
    let url=URL(fileURLWithPath:CommandLine.arguments[1]+"/"+name+".png")
    let request=VNDetectBarcodesRequest()
    request.revision=VNDetectBarcodesRequestRevision1
    request.usesCPUOnly=true
    request.symbologies=[.qr]
    do {
        try VNImageRequestHandler(url:url).perform([request])
        print(name+": "+((request.results ?? []).compactMap { $0.payloadStringValue }.joined(separator:"\n")))
    } catch { print(name+": "+error.localizedDescription) }
}
