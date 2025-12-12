// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "FlutterModule",
    platforms: [
        .iOS(.v13)
    ],
    products: [
        .library(
            name: "FlutterModule",
            targets: ["FlutterModule"]
        ),
    ],
    dependencies: [],
    targets: [
        .target(
            name: "FlutterModule",
            dependencies: [],
            path: "ios/Runner"
        ),
    ]
)
