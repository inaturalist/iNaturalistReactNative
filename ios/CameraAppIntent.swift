//
//  File.swift
//  iNaturalistReactNative
//
//  Created by Alex Shepard on 4/1/25.
//

import AppIntents
import UIKit

@available(iOS 18, *)
struct CameraShortcuts: AppShortcutsProvider {
  static var appShortcuts: [AppShortcut] {
    AppShortcut(
      intent: CameraIntent(),
      phrases: [
        "Open the \(.applicationName) camera",
        "Open the camera in \(.applicationName)",
        "Open the default camera in \(.applicationName)",
      ],
      shortTitle: "open the inat camera",
      systemImageName: "leaf"
    )
  }
}

@available(iOS 18, *)
struct CameraIntent: AppIntent {
  static let title: LocalizedStringResource = "Launch the iNat camera"
  
  func perform() async throws -> some IntentResult & OpensIntent {
    // no such observation as obs id 1.
    // so launch the camera.
    // this doesn't work as an iniital url, but
    // can work if the app is launched and backgrounded
    
    // let obsUrl = URL(string: "https://www.inaturalist.org/observations/1")!
    
    let camUrl = URL(string: "https://www.inaturalist.org/app/ai_camera")!
    
    return .result(opensIntent: OpenURLIntent(camUrl))
  }
  
  static let openAppWhenRun: Bool = true
}
