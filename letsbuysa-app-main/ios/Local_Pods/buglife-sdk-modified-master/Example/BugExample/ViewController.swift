//
//  ViewController.swift
//  BugExample
//
//  Created by Satish Babariya on 21/02/19.
//  Copyright © 2019 Satish Babariya. All rights reserved.
//

import UIKit

class ViewController: UIViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
        
        let image : UIImage = UIImage.init(named: "icon")!
        print(image.pngData()!.base64EncodedString())
        
    }


}

