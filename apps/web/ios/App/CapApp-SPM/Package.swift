// swift-tools-version: 5.9
import PackageDescription

// DO NOT MODIFY THIS FILE - managed by Capacitor CLI commands
let package = Package(
    name: "CapApp-SPM",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "CapApp-SPM",
            targets: ["CapApp-SPM"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", exact: "8.5.0"),
        .package(name: "CapacitorCommunitySqlite", path: "../../../../../node_modules/.pnpm/@capacitor-community+sqlite@8.1.1_@capacitor+core@8.5.0/node_modules/@capacitor-community/sqlite"),
        .package(name: "CapacitorActionSheet", path: "../../../../../node_modules/.pnpm/@capacitor+action-sheet@8.1.1_@capacitor+core@8.5.0/node_modules/@capacitor/action-sheet"),
        .package(name: "CapacitorCamera", path: "../../../../../node_modules/.pnpm/@capacitor+camera@8.2.2_@capacitor+core@8.5.0/node_modules/@capacitor/camera"),
        .package(name: "CapacitorGeolocation", path: "../../../../../node_modules/.pnpm/@capacitor+geolocation@8.2.0_@capacitor+core@8.5.0/node_modules/@capacitor/geolocation"),
        .package(name: "CapacitorGoogleMaps", path: "../../../../../node_modules/.pnpm/@capacitor+google-maps@8.0.1_@capacitor+core@8.5.0/node_modules/@capacitor/google-maps"),
        .package(name: "CapacitorToast", path: "../../../../../node_modules/.pnpm/@capacitor+toast@8.0.1_@capacitor+core@8.5.0/node_modules/@capacitor/toast")
    ],
    targets: [
        .target(
            name: "CapApp-SPM",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "CapacitorCommunitySqlite", package: "CapacitorCommunitySqlite"),
                .product(name: "CapacitorActionSheet", package: "CapacitorActionSheet"),
                .product(name: "CapacitorCamera", package: "CapacitorCamera"),
                .product(name: "CapacitorGeolocation", package: "CapacitorGeolocation"),
                .product(name: "CapacitorGoogleMaps", package: "CapacitorGoogleMaps"),
                .product(name: "CapacitorToast", package: "CapacitorToast")
            ]
        )
    ]
)
