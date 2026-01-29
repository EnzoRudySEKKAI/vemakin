
import {
  Camera as CameraIcon, Aperture, Sun, Mic,
  Package, ShoppingBag, Monitor, Radio, Drill,
  PenLine, Scissors, Music, Layers, Palette, Plane,
  Triangle, Activity, CircleDot
} from 'lucide-react';
import { Equipment, PostProdTask, Shot, Currency, Note, CrewMember } from './types.ts';

export const PROJECTS = ["Neon Paradox", "Urban Echoes", "Silent Sky"];
export const SHOOT_DATES = [
  "Oct 24, 2024",
  "Oct 25, 2024",
  "Oct 26, 2024",
  "Oct 27, 2024",
  "Oct 28, 2024"
];

export const POST_PROD_CATEGORIES = [
  { label: 'Script', icon: PenLine, color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-100', activeBg: 'bg-indigo-600', activeText: 'text-white' },
  { label: 'Editing', icon: Scissors, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100', activeBg: 'bg-orange-600', activeText: 'text-white' },
  { label: 'Sound', icon: Music, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100', activeBg: 'bg-blue-600', activeText: 'text-white' },
  { label: 'VFX', icon: Layers, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-100', activeBg: 'bg-purple-600', activeText: 'text-white' },
  { label: 'Color', icon: Palette, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100', activeBg: 'bg-red-600', activeText: 'text-white' },
];

// --- MOCK DATABASE ---
// Fully harmonized technical specifications
export const GEAR_DATABASE = {
  Camera: {
    brands: {
      "Sony": {
        models: {
          "Venice 2 8K": { specs: { sensor: "Full Frame 8.6K", resolution: "8640 x 5760", mount: "PL Mount", frameRate: "90 fps @ 8K", dynamicRange: "16 Stops", nativeISO: "800 / 3200", media: "AXS Cards", weight: "4.3 kg" } },
          "Burano": { specs: { sensor: "Full Frame 8.6K", resolution: "8632 x 4856", mount: "PL / E-Mount", frameRate: "30 fps @ 8.6K", dynamicRange: "16 Stops", nativeISO: "800 / 3200", media: "CFexpress Type B", weight: "2.4 kg" } },
          "FX9": { specs: { sensor: "Full Frame 6K", resolution: "4096 x 2160", mount: "E-Mount", frameRate: "60 fps @ 4K", dynamicRange: "15+ Stops", nativeISO: "800 / 4000", media: "XQD Cards", weight: "2.0 kg" } },
          "FX6": { specs: { sensor: "Full Frame 4K", resolution: "4096 x 2160", mount: "E-Mount", frameRate: "120 fps @ 4K", dynamicRange: "15+ Stops", nativeISO: "800 / 12800", media: "CFexpress A / SD", weight: "0.89 kg" } },
          "FX3": { specs: { sensor: "Full Frame 4K", resolution: "3840 x 2160", mount: "E-Mount", frameRate: "120 fps @ 4K", dynamicRange: "15+ Stops", nativeISO: "800 / 12800", media: "CFexpress A / SD", weight: "0.64 kg" } },
          "FX30": { specs: { sensor: "APS-C (S35)", resolution: "3840 x 2160", mount: "E-Mount", frameRate: "120 fps @ 4K", dynamicRange: "14+ Stops", nativeISO: "800 / 2500", media: "CFexpress A / SD", weight: "0.56 kg" } },
          "A7S III": { specs: { sensor: "Full Frame 4K", resolution: "3840 x 2160", mount: "E-Mount", frameRate: "120 fps @ 4K", dynamicRange: "15 Stops", nativeISO: "640 / 12800", media: "CFexpress A / SD", weight: "0.61 kg" } }
        }
      },
      "ARRI": {
        models: {
          "Alexa 35": { specs: { sensor: "S35 ALEV 4", resolution: "4608 x 3164", mount: "LPL Mount", frameRate: "120 fps @ 4.6K", dynamicRange: "17 Stops", nativeISO: "800", media: "Codex Compact", weight: "2.9 kg" } },
          "Alexa Mini LF": { specs: { sensor: "Large Format", resolution: "4448 x 3096", mount: "LPL Mount", frameRate: "60 fps @ 4.5K", dynamicRange: "14.5 Stops", nativeISO: "800", media: "Codex Compact", weight: "2.6 kg" } },
          "Alexa Mini": { specs: { sensor: "S35 ALEV 3", resolution: "3424 x 2202", mount: "PL Mount", frameRate: "200 fps @ 2K", dynamicRange: "14+ Stops", nativeISO: "800", media: "CFast 2.0", weight: "2.3 kg" } }
        }
      },
      "RED": {
        models: {
          "V-Raptor [X] 8K": { specs: { sensor: "Vista Vision 8K", resolution: "8192 x 4320", mount: "RF Mount", frameRate: "120 fps @ 8K", dynamicRange: "17+ Stops", nativeISO: "800", media: "CFexpress Type B", weight: "1.8 kg" } },
          "Komodo-X": { specs: { sensor: "S35 6K", resolution: "6144 x 3240", mount: "RF Mount", frameRate: "80 fps @ 6K", dynamicRange: "16.5 Stops", nativeISO: "800", media: "CFexpress Type B", weight: "1.2 kg" } },
          "Komodo 6K": { specs: { sensor: "S35 6K", resolution: "6144 x 3240", mount: "RF Mount", frameRate: "40 fps @ 6K", dynamicRange: "16 Stops", nativeISO: "800", media: "CFast 2.0", weight: "1.0 kg" } }
        }
      },
      "Blackmagic": {
        models: {
          "Ursa Cine 12K": { specs: { sensor: "Large Format 12K", resolution: "12288 x 6480", mount: "PL Mount", frameRate: "80 fps @ 12K", dynamicRange: "16 Stops", nativeISO: "800 / 3200", media: "M.2 SSD Module", weight: "3.9 kg" } },
          "Pyxis 6K": { specs: { sensor: "Full Frame 6K", resolution: "6048 x 4032", mount: "L-Mount", frameRate: "36 fps @ 6K", dynamicRange: "13 Stops", nativeISO: "400 / 3200", media: "CFexpress Type B", weight: "1.5 kg" } },
          "Pocket 6K Pro": { specs: { sensor: "S35 6K", resolution: "6144 x 3456", mount: "EF Mount", frameRate: "50 fps @ 6K", dynamicRange: "13 Stops", nativeISO: "400 / 3200", media: "CFast / SD / SSD", weight: "1.2 kg" } }
        }
      },
      "Canon": {
        models: {
          "C500 Mark II": { specs: { sensor: "Full Frame 5.9K", resolution: "5952 x 3140", mount: "EF Mount", frameRate: "60 fps @ 5.9K", dynamicRange: "15+ Stops", nativeISO: "800", media: "CFexpress Type B", weight: "1.7 kg" } },
          "C70": { specs: { sensor: "S35 DGO 4K", resolution: "4096 x 2160", mount: "RF Mount", frameRate: "120 fps @ 4K", dynamicRange: "16+ Stops", nativeISO: "800", media: "SD Cards", weight: "1.1 kg" } },
          "R5 C": { specs: { sensor: "Full Frame 8K", resolution: "8192 x 4320", mount: "RF Mount", frameRate: "60 fps @ 8K", dynamicRange: "14 Stops", nativeISO: "800", media: "CFexpress B / SD", weight: "0.77 kg" } }
        }
      }
    }
  },
  Lens: {
    brands: {
      "Sony": {
        models: {
          "FE 24-70mm GM II": { specs: { focalLength: "24-70mm", aperture: "f/2.8", mount: "E-Mount", coverage: "Full Frame", minFocus: "0.21m", frontDiameter: "82mm", weight: "695g", filterSize: "82mm" } },
          "FE 70-200mm GM II": { specs: { focalLength: "70-200mm", aperture: "f/2.8", mount: "E-Mount", coverage: "Full Frame", minFocus: "0.40m", frontDiameter: "77mm", weight: "1045g", filterSize: "77mm" } },
          "FE 50mm GM": { specs: { focalLength: "50mm", aperture: "f/1.2", mount: "E-Mount", coverage: "Full Frame", minFocus: "0.40m", frontDiameter: "72mm", weight: "778g", filterSize: "72mm" } }
        }
      },
      "ARRI / Zeiss": {
        models: {
          "Master Prime 18": { specs: { focalLength: "18mm", aperture: "T1.3", mount: "PL Mount", coverage: "S35", minFocus: "0.35m", frontDiameter: "114mm", weight: "2.2 kg", filterSize: "N/A" } },
          "Master Prime 25": { specs: { focalLength: "25mm", aperture: "T1.3", mount: "PL Mount", coverage: "S35", minFocus: "0.35m", frontDiameter: "114mm", weight: "2.3 kg", filterSize: "N/A" } },
          "Master Prime 50": { specs: { focalLength: "50mm", aperture: "T1.3", mount: "PL Mount", coverage: "S35", minFocus: "0.50m", frontDiameter: "114mm", weight: "2.6 kg", filterSize: "N/A" } }
        }
      },
      "Cooke": {
        models: {
          "S8/i 25mm": { specs: { focalLength: "25mm", aperture: "T1.4", mount: "PL Mount", coverage: "Full Frame", minFocus: "0.30m", frontDiameter: "104mm", weight: "2.1 kg", filterSize: "N/A" } },
          "S8/i 50mm": { specs: { focalLength: "50mm", aperture: "T1.4", mount: "PL Mount", coverage: "Full Frame", minFocus: "0.50m", frontDiameter: "104mm", weight: "2.4 kg", filterSize: "N/A" } },
          "Anamorphic/i 32mm": { specs: { focalLength: "32mm", aperture: "T2.3", mount: "PL Mount", coverage: "S35", minFocus: "0.85m", frontDiameter: "110mm", weight: "3.1 kg", filterSize: "N/A" } }
        }
      },
      "Sigma": {
        models: {
          "Art 24-70mm DG DN": { specs: { focalLength: "24-70mm", aperture: "f/2.8", mount: "E-Mount", coverage: "Full Frame", minFocus: "0.18m", frontDiameter: "82mm", weight: "835g", filterSize: "82mm" } },
          "High Speed 18-35": { specs: { focalLength: "18-35mm", aperture: "T2.0", mount: "EF Mount", coverage: "S35", minFocus: "0.28m", frontDiameter: "95mm", weight: "1.4 kg", filterSize: "82mm" } }
        }
      },
      "DZOFilm": {
        models: {
          "Vespid Prime 25mm": { specs: { focalLength: "25mm", aperture: "T2.1", mount: "PL Mount", coverage: "Full Frame", minFocus: "0.30m", frontDiameter: "80mm", weight: "732g", filterSize: "77mm" } },
          "Vespid Prime 50mm": { specs: { focalLength: "50mm", aperture: "T2.1", mount: "PL Mount", coverage: "Full Frame", minFocus: "0.60m", frontDiameter: "80mm", weight: "732g", filterSize: "77mm" } },
          "Pictor Zoom 20-55": { specs: { focalLength: "20-55mm", aperture: "T2.8", mount: "PL Mount", coverage: "S35", minFocus: "0.60m", frontDiameter: "95mm", weight: "1.5 kg", filterSize: "86mm" } }
        }
      }
    }
  },
  Filter: {
    brands: {
      "Tiffen": {
        models: {
          "NATural ND Kit": { specs: { type: "ND", density: "0.3 - 2.1", size: "4x5.65", material: "Glass", stops: "1-7", weight: "200g" } },
          "Black Pro-Mist 1/8": { specs: { type: "Diffusion", strength: "1/8", size: "4x5.65", material: "Glass", effect: "Halation", weight: "150g" } }
        }
      },
      "PolarPro": {
        models: {
          "Peter McKinnon VND": { specs: { type: "Variable ND", density: "2-5 Stop", size: "82mm", material: "Quartz", mount: "Threaded", weight: "50g" } },
          "Recon Director Kit": { specs: { type: "System", components: "VND + Mist", size: "82mm", material: "Glass", mount: "Matte Box", weight: "400g" } }
        }
      },
      "Schneider": {
        models: {
          "Rhodium FSND": { specs: { type: "Full Spectrum ND", density: "0.3 - 2.4", size: "4x5.65", material: "Glass", stops: "1-8", weight: "210g" } }
        }
      }
    }
  },
  Light: {
    brands: {
      "Aputure": {
        models: {
          "LS 1200d Pro": { specs: { class: "LED Point Source", output: "83,100 lux @ 3m", powerDraw: "1200W", cct: "5600K", cri: "≥96", mount: "Bowens", control: "Sidus / DMX", weight: "8.9 kg" } },
          "LS 600c Pro": { specs: { class: "LED Color Point", output: "50,700 lux @ 1m", powerDraw: "600W", cct: "2300K-10000K", cri: "≥95", mount: "Bowens", control: "Sidus / CRMX", weight: "5.8 kg" } },
          "LS 300x": { specs: { class: "LED Bi-Color", output: "56,000 lux @ 1m", powerDraw: "350W", cct: "2700K-6500K", cri: "≥96", mount: "Bowens", control: "Sidus Link", weight: "11.4 kg" } },
          "Amaran F22c": { specs: { class: "LED Flex Mat", output: "6,420 lux @ 1m", powerDraw: "200W", cct: "2500K-7500K", cri: "≥95", mount: "X-Bracket", control: "Sidus Link", weight: "0.44 kg" } }
        }
      },
      "ARRI": {
        models: {
          "SkyPanel X21": { specs: { class: "LED Soft Panel", output: "50,000 lux @ 1m", powerDraw: "800W", cct: "1500K-20000K", cri: "≥99", mount: "Yoke", control: "LumenRadio", weight: "15 kg" } },
          "SkyPanel S60-C": { specs: { class: "LED Soft Panel", output: "11,250 lux @ 1m", powerDraw: "420W", cct: "2800K-10000K", cri: "≥95", mount: "Yoke", control: "DMX / RDM", weight: "12 kg" } },
          "M18 HMI": { specs: { class: "HMI Fresnel", output: "High Output", powerDraw: "1800W", cct: "5600K", cri: "≥98", mount: "Junior Pin", control: "Ballast", weight: "10.5 kg" } }
        }
      },
      "Astera": {
        models: {
          "Titan Tube": { specs: { class: "LED Tube (1m)", output: "2,900 lm", powerDraw: "72W", cct: "1750K-20000K", cri: "≥96", mount: "Clamps", control: "CRMX / App", weight: "1.35 kg" } },
          "Helios Tube": { specs: { class: "LED Tube (0.5m)", output: "1,340 lm", powerDraw: "36W", cct: "1750K-20000K", cri: "≥96", mount: "Clamps", control: "CRMX / App", weight: "0.76 kg" } }
        }
      },
      "Nanlite": {
        models: {
          "Forza 720B": { specs: { class: "LED Bi-Color", output: "84,460 lux @ 1m", powerDraw: "800W", cct: "2700K-6500K", cri: "≥96", mount: "Bowens", control: "App / DMX", weight: "5.3 kg" } },
          "PavoTube II 30X": { specs: { class: "LED Tube (4ft)", output: "700 lux @ 1m", powerDraw: "70W", cct: "2700K-12000K", cri: "≥97", mount: "T12 / 1/4-20", control: "App / DMX", weight: "1.6 kg" } }
        }
      }
    }
  },
  Tripod: {
    brands: {
      "Sachtler": {
        models: {
          "Video 18 S2": { specs: { headType: "Fluid Head", maxPayload: "22 kg", bowlSize: "100mm", heightRange: "67-168 cm", material: "Carbon Fiber", counterbalance: "16 Steps", weight: "8.4 kg" } },
          "Aktiv8": { specs: { headType: "Fluid Head", maxPayload: "12 kg", bowlSize: "75mm", heightRange: "23-170 cm", material: "Carbon Fiber", counterbalance: "15+0 Steps", weight: "6.3 kg" } }
        }
      },
      "OConnor": {
        models: {
          "2575D": { specs: { headType: "Fluid Head", maxPayload: "40.8 kg", bowlSize: "Mitchell/150", heightRange: "N/A", material: "Aluminum", counterbalance: "Continuous", weight: "10.4 kg" } },
          "1040": { specs: { headType: "Fluid Head", maxPayload: "20 kg", bowlSize: "100mm", heightRange: "N/A", material: "Aluminum", counterbalance: "Continuous", weight: "4.8 kg" } }
        }
      },
      "Manfrotto": {
        models: {
          "504X": { specs: { headType: "Fluid Head", maxPayload: "12 kg", bowlSize: "Flat Base", heightRange: "40-170 cm", material: "Aluminum", counterbalance: "4 Steps", weight: "3.5 kg" } },
          "Nitrotech 608": { specs: { headType: "Fluid Head", maxPayload: "8 kg", bowlSize: "Flat Base", heightRange: "N/A", material: "Aluminum", counterbalance: "Continuous", weight: "2.2 kg" } }
        }
      }
    }
  },
  Stabilizer: {
    brands: {
      "DJI": {
        models: {
          "Ronin 2": { specs: { type: "Gimbal", maxPayload: "13.6 kg", axes: "3-Axis", batteryLife: "8 hours", weight: "5.5 kg", connectivity: "Wifi / Bluetooth", dimensions: "630x416x720 mm" } },
          "RS 4 Pro": { specs: { type: "Handheld Gimbal", maxPayload: "4.5 kg", axes: "3-Axis", batteryLife: "13 hours", weight: "1.6 kg", connectivity: "Bluetooth 5.1", dimensions: "271x283x75 mm" } },
          "RS 3 Mini": { specs: { type: "Compact Gimbal", maxPayload: "2.0 kg", axes: "3-Axis", batteryLife: "10 hours", weight: "0.8 kg", connectivity: "Bluetooth 5.1", dimensions: "180x159x296 mm" } }
        }
      },
      "Easyrig": {
        models: {
          "Vario 5": { specs: { type: "Body Support", maxPayload: "5-17 kg", axes: "Vertical Damp", batteryLife: "N/A", weight: "5.2 kg", connectivity: "N/A", dimensions: "Adjustable" } },
          "Minimax": { specs: { type: "Body Support", maxPayload: "2-7 kg", axes: "Vertical Damp", batteryLife: "N/A", weight: "3.4 kg", connectivity: "N/A", dimensions: "Compact" } }
        }
      },
      "Tilta": {
        models: {
          "Hydra Alien": { specs: { type: "Car Mount", maxPayload: "Wait for spec", axes: "Shock Absorbing", batteryLife: "N/A", weight: "Various", connectivity: "N/A", dimensions: "Modular" } },
          "Advanced Ring Grip": { specs: { type: "Gimbal Ring", maxPayload: "N/A", axes: "Stabilization", batteryLife: "Power Pass", weight: "1.2 kg", connectivity: "Contacts", dimensions: "Ring" } }
        }
      }
    }
  },
  Audio: {
    brands: {
      "Sennheiser": {
        models: {
          "MKH 416": { specs: { type: "Shotgun Mic", pattern: "Supercardioid", freqResponse: "40Hz - 20kHz", sensitivity: "25 mV/Pa", maxSPL: "130 dB", power: "48V Phantom", connector: "XLR-3", weight: "165g" } },
          "MKH 50": { specs: { type: "Condenser Mic", pattern: "Supercardioid", freqResponse: "40Hz - 20kHz", sensitivity: "25 mV/Pa", maxSPL: "134 dB", power: "48V Phantom", connector: "XLR-3", weight: "100g" } },
          "G4 Wireless": { specs: { type: "Lavalier System", pattern: "Omni", freqResponse: "80Hz - 18kHz", sensitivity: "N/A", maxSPL: "N/A", power: "2x AA Batteries", connector: "3.5mm", weight: "160g" } }
        }
      },
      "Deity": {
        models: {
          "S-Mic 2": { specs: { type: "Shotgun Mic", pattern: "Supercardioid", freqResponse: "50Hz - 20kHz", sensitivity: "32 mV/Pa", maxSPL: "130 dB", power: "48V Phantom", connector: "XLR-3", weight: "198g" } },
          "Theos Digital": { specs: { type: "Wireless System", pattern: "Omni", freqResponse: "20Hz - 20kHz", sensitivity: "N/A", maxSPL: "N/A", power: "AA / USB-C", connector: "3.5mm Locking", weight: "145g" } }
        }
      },
      "Sound Devices": {
        models: {
          "MixPre-6 II": { specs: { type: "Field Recorder", pattern: "N/A", freqResponse: "10Hz - 80kHz", sensitivity: "N/A", maxSPL: "N/A", power: "AA / L-Mount / USB", connector: "4x XLR/TRS", weight: "560g" } },
          "888": { specs: { type: "Prod. Mixer", pattern: "N/A", freqResponse: "10Hz - 80kHz", sensitivity: "N/A", maxSPL: "N/A", power: "L-Mount / DC", connector: "8x XLR/TA3", weight: "1.83 kg" } }
        }
      }
    }
  },
  Grip: {
    brands: {
      "Avenger": {
        models: {
          "C-Stand 33": { specs: { type: "Stand", maxLoad: "10 kg", maxHeight: "328 cm", minHeight: "134 cm", footprint: "95 cm", material: "Chrome Steel", mount: "Junior/Baby", weight: "6.2 kg" } },
          "Combo Stand 45": { specs: { type: "Stand", maxLoad: "40 kg", maxHeight: "450 cm", minHeight: "179 cm", footprint: "134 cm", material: "Steel", mount: "Junior/Baby", weight: "13 kg" } }
        }
      },
      "Matthews": {
        models: {
          "RoadRags Kit": { specs: { type: "Modifier", maxLoad: "N/A", maxHeight: "N/A", minHeight: "N/A", footprint: "N/A", material: "Fabric/Steel", mount: "N/A", weight: "4 kg" } },
          "Apple Box Full": { specs: { type: "Support", maxLoad: "100+ kg", maxHeight: "20 cm", minHeight: "N/A", footprint: "50x30 cm", material: "Plywood", mount: "N/A", weight: "3 kg" } }
        }
      }
    }
  },
  Monitoring: {
    brands: {
      "SmallHD": {
        models: {
          "Ultra 7": { specs: { screen: "7-inch LCD", resolution: "1920 x 1200", brightness: "2300 nits", inputs: "6G-SDI / HDMI", power: "2-Pin Lemo", features: "Touch / Cam Control", dimensions: "180x118x33 mm", weight: "0.6 kg" } },
          "Cine 5": { specs: { screen: "5-inch LCD", resolution: "1920 x 1080", brightness: "2000 nits", inputs: "3G-SDI / HDMI", power: "2-Pin Lemo", features: "Touch / Cam Control", dimensions: "133x84x32 mm", weight: "0.4 kg" } },
          "Cine 13": { specs: { screen: "13-inch LCD", resolution: "3840 x 2160", brightness: "1500 nits", inputs: "12G-SDI / HDMI", power: "4-Pin XLR", features: "4K High Bright", dimensions: "338x234x53 mm", weight: "3.2 kg" } }
        }
      },
      "Atomos": {
        models: {
          "Ninja V+": { specs: { screen: "5-inch LCD", resolution: "1920 x 1080", brightness: "1000 nits", inputs: "HDMI 2.0", power: "NP-F Battery", features: "8K RAW Recording", dimensions: "151x91x31 mm", weight: "0.36 kg" } },
          "Shogun Connect": { specs: { screen: "7-inch LCD", resolution: "1920 x 1200", brightness: "2000 nits", inputs: "12G-SDI / HDMI", power: "NP-F Battery", features: "Cloud / RAW", dimensions: "198x133x40 mm", weight: "0.7 kg" } }
        }
      }
    }
  },
  Wireless: {
    brands: {
      "Teradek": {
        models: {
          "Bolt 6 LT 750": { specs: { range: "750 ft", delay: "<0.001 sec", resolution: "4K HDR", inputs: "HDMI / 3G-SDI", freq: "6GHz", power: "2-Pin Lemo", multicast: "No", weight: "296g" } },
          "Bolt 6 XT 3000": { specs: { range: "3000 ft", delay: "<0.001 sec", resolution: "4K HDR", inputs: "12G-SDI / HDMI", freq: "6GHz", power: "2-Pin Lemo", multicast: "Yes", weight: "380g" } }
        }
      },
      "DJI": {
        models: {
          "Transmission": { specs: { range: "20,000 ft", delay: "Ultra-Low", resolution: "1080p/60", inputs: "SDI / HDMI", freq: "2.4/5.8 GHz", power: "WB37 / NP-F", multicast: "Unlimited", weight: "350g" } }
        }
      }
    }
  },
  Drone: {
    brands: {
      "DJI": {
        models: {
          "Mavic 3 Pro Cine": { specs: { type: "Quadcopter", camera: "Hasselblad 4/3", res: "5.1K ProRes", flightTime: "43 mins", transmission: "15 km", sensors: "Omnidirectional", speed: "21 m/s", weight: "958g" } },
          "Inspire 3": { specs: { type: "Pro Cinema", camera: "X9-8K Air", res: "8K CinemaDNG", flightTime: "28 mins", transmission: "15 km", sensors: "Omnidirectional", speed: "94 kph", weight: "3.9 kg" } },
          "Avata 2": { specs: { type: "FPV", camera: "1/1.3-inch", res: "4K 60fps", flightTime: "23 mins", transmission: "13 km", sensors: "Down/Back", speed: "27 m/s", weight: "377g" } }
        }
      }
    }
  },
  Props: {
    brands: {
      "Generic": {
        models: {
          "Vintage Lamp": { specs: { type: "Practical", era: "1920s", material: "Brass/Glass", condition: "Fragile", quantity: "1", dimensions: "30x15 cm", power: "E27 Bulb", weight: "1.2 kg" } },
          "Sci-Fi Visor": { specs: { type: "Costume", era: "Future", material: "Plastic/LED", condition: "Good", quantity: "3", dimensions: "Head Size", power: "CR2032", weight: "0.2 kg" } }
        }
      }
    }
  }
};

export const CATEGORY_ICONS = {
  Camera: CameraIcon,
  Lens: Aperture,
  Light: Sun,
  Filter: CircleDot,
  Audio: Mic,
  Tripod: Triangle,
  Stabilizer: Activity,
  Support: Triangle, // Fallback
  Grip: Drill,
  Monitoring: Monitor,
  Wireless: Radio,
  Drone: Plane,
  Props: ShoppingBag,
  Other: Package,
};

export const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' }
];

// Re-mapped initial inventory to match new harmonized specs
export const GLOBAL_INVENTORY: Equipment[] = [
  {
    id: 'e1', name: 'RED V-Raptor XL', customName: 'A-CAM', category: 'Camera', pricePerDay: 1200, quantity: 1, isOwned: true, status: 'operational',
    specs: { sensor: "Vista Vision 8K", resolution: "8192 x 4320", mount: "PL Mount", frameRate: "120 fps @ 8K", dynamicRange: "17+ Stops", nativeISO: "800", media: "CFexpress Type B", weight: "3.6 kg" }
  },
  {
    id: 'e2', name: 'OConnor 2575D', customName: 'HEAVY HEAD', category: 'Tripod', pricePerDay: 150, quantity: 1, isOwned: true, status: 'operational',
    specs: { headType: "Fluid Head", maxPayload: "40.8 kg", bowlSize: "Mitchell/150", heightRange: "N/A", material: "Aluminum", counterbalance: "Continuous", weight: "10.4 kg" }
  },
  {
    id: 'e7', name: 'Video 18 S2', customName: 'TRIPOD 01', category: 'Tripod', pricePerDay: 80, quantity: 2, isOwned: true, status: 'operational',
    specs: { headType: "Fluid Head", maxPayload: "22 kg", bowlSize: "100mm", heightRange: "67-168 cm", material: "Carbon Fiber", counterbalance: "16 Steps", weight: "8.4 kg" }
  },
  {
    id: 'e3', name: 'Ultra 7', customName: 'MON 01', category: 'Monitoring', pricePerDay: 85, quantity: 2, isOwned: true, status: 'operational',
    specs: { screen: "7-inch LCD", resolution: "1920 x 1200", brightness: "2300 nits", inputs: "6G-SDI / HDMI", power: "2-Pin Lemo", features: "Touch / Cam Control", dimensions: "180x118x33 mm", weight: "0.6 kg" }
  },
  {
    id: 'e8', name: 'C-Stand 33', customName: 'C-STAND KIT', category: 'Grip', pricePerDay: 15, quantity: 12, isOwned: true, status: 'operational',
    specs: { type: "Stand", maxLoad: "10 kg", maxHeight: "328 cm", minHeight: "134 cm", footprint: "95 cm", material: "Chrome Steel", mount: "Junior/Baby", weight: "6.2 kg" }
  },
  {
    id: 'e4', name: 'CineSlider 3ft', customName: 'SLIDER 3FT', category: 'Grip', pricePerDay: 95, quantity: 1, isOwned: false, status: 'maintenance',
    specs: { type: "Slider", maxLoad: "36 kg", maxHeight: "N/A", minHeight: "N/A", footprint: "90 cm", material: "Aluminum/Steel", mount: "N/A", weight: "5.4 kg" }
  },
  {
    id: 'e5', name: 'Bolt 6 LT 750', customName: 'TX 01', category: 'Wireless', pricePerDay: 120, quantity: 1, isOwned: true, status: 'operational',
    specs: { range: "750 ft", delay: "<0.001 sec", resolution: "4K HDR", inputs: "HDMI / 3G-SDI", freq: "6GHz", power: "2-Pin Lemo", multicast: "No", weight: "296g" }
  },
  {
    id: 'e6', name: 'Master Prime 50', customName: 'PRIME 50', category: 'Lens', pricePerDay: 450, quantity: 1, isOwned: false, status: 'operational',
    specs: { focalLength: "50mm", aperture: "T1.3", mount: "PL Mount", coverage: "S35", minFocus: "0.50m", frontDiameter: "114mm", weight: "2.6 kg", filterSize: "N/A" }
  },
  {
    id: 'e9', name: 'NATural ND Kit', customName: 'ND SET', category: 'Filter', pricePerDay: 45, quantity: 1, isOwned: true, status: 'operational',
    specs: { type: "ND", density: "0.3 - 2.1", size: "4x5.65", material: "Glass", stops: "1-7", weight: "200g" }
  }
];

export const INITIAL_SHOTS: Shot[] = [
  {
    id: '1', title: 'Opening Scene - Wide', description: 'Establishing shot of the city at dawn.', status: 'done',
    startTime: '08:00', duration: '2h', location: 'Rooftop Central', remarks: 'Needs ND filter.',
    equipmentIds: ['e1', 'e2', 'e3', 'e5'], preparedEquipmentIds: ['e1', 'e2', 'e3', 'e5'], date: SHOOT_DATES[0],
    sceneNumber: '1A'
  },
  {
    id: '2', title: 'Close-up Elara', description: 'Reaction shot when she sees the signal.', status: 'done',
    startTime: '10:30', duration: '1.5h', location: 'Rooftop Central', remarks: 'Focus on eyes.',
    equipmentIds: ['e1', 'e3', 'e6'], preparedEquipmentIds: ['e1', 'e3', 'e6'], date: SHOOT_DATES[0],
    sceneNumber: '2B'
  },
  {
    id: '3', title: 'Industrial Chase', description: 'POV shot from the pursuer.', status: 'pending',
    startTime: '13:00', duration: '3h', location: 'Industrial District', remarks: 'High energy.',
    equipmentIds: ['e1', 'e4', 'e3', 'e5'], preparedEquipmentIds: ['e1', 'e4'], date: SHOOT_DATES[0],
    sceneNumber: '4C'
  },
  {
    id: '4', title: 'The Encounter', description: 'Wide shot of the two characters meeting under the neon signs.', status: 'pending',
    startTime: '19:30', duration: '2.5h', location: 'Neon Alley', remarks: 'Atmospheric lighting.',
    equipmentIds: ['e1', 'e7', 'e3', 'e6'], preparedEquipmentIds: [], date: SHOOT_DATES[0],
    sceneNumber: '8F'
  },
  {
    id: '5', title: 'Interrogation Interior', description: 'Low key lighting dialogue.', status: 'pending',
    startTime: '09:00', duration: '4h', location: 'Secret HQ', remarks: 'Needs mist.',
    equipmentIds: ['e1', 'e2', 'e3', 'e6', 'e8'], preparedEquipmentIds: ['e8'], date: SHOOT_DATES[1],
    sceneNumber: '12A'
  },
  {
    id: '6', title: 'Club Infiltration', description: 'Steadicam-like follow shot through the crowd.', status: 'pending',
    startTime: '14:00', duration: '5h', location: 'Neon Club', remarks: 'Challenging focus.',
    equipmentIds: ['e1', 'e3', 'e5'], preparedEquipmentIds: [], date: SHOOT_DATES[1],
    sceneNumber: '15D'
  }
];

export const POSTPROD_TASKS: PostProdTask[] = [
  {
    id: 'pp1',
    category: 'Script',
    title: 'Dialogue Polish - Sc 8F',
    status: 'progress',
    priority: 'medium',
    dueDate: SHOOT_DATES[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'pp2',
    category: 'VFX',
    title: 'Hologram Glitch R&D',
    status: 'todo',
    priority: 'high',
    dueDate: SHOOT_DATES[3],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'pp3',
    category: 'Color',
    title: 'Neon Look Dev',
    status: 'done',
    priority: 'critical',
    dueDate: SHOOT_DATES[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'pp4',
    category: 'Sound',
    title: 'Ambience Mixdown - Sc 15D',
    status: 'todo',
    priority: 'high',
    dueDate: SHOOT_DATES[1],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
];

export const INITIAL_NOTES: Note[] = [
  // Notes linked to Shots
  {
    id: 'n_s1',
    title: 'Camera Motion Alert',
    content: 'Steadicam operator requested a lighter build for the rooftop chase. We need to swap the prime kit.',
    createdAt: new Date(Date.now() - 200000).toISOString(),
    updatedAt: new Date().toISOString(),
    shotId: '3', // Industrial Chase
    attachments: []
  },
  {
    id: 'n_s2',
    title: 'Lighting Consistency',
    content: 'The neon sign in the background was flickering at 50Hz during the wide shot. We need to match this practical frequency in the close-ups.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    shotId: '4', // The Encounter
    attachments: []
  },

  // Notes linked to Pipeline Tasks
  {
    id: 'n_t1',
    title: 'VFX Supervision Request',
    content: 'The glitch effect needs to feel organic, less digital. Reference the "Blade Runner 2049" hologram sequence.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    taskId: 'pp2', // VFX Task
    attachments: []
  },
  {
    id: 'n_t2',
    title: 'Script Change',
    content: 'Jane suggests cutting the monologue in Scene 8F. It slows down the pacing before the encounter.',
    createdAt: new Date(Date.now() - 172800000 * 1.5).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
    taskId: 'pp1', // Script Task
    attachments: []
  },

  // General Notes
  {
    id: 'n_g1',
    title: 'Art Department Meeting',
    content: 'Discuss prop damage from yesterday. We need to order backup visors for the stunt team.',
    createdAt: new Date(Date.now() - 200000000 * 1.1).toISOString(),
    updatedAt: new Date(Date.now() - 200000000).toISOString(),
    attachments: []
  }
];

export const INITIAL_CREW: CrewMember[] = [
  { id: 'c1', name: 'Sarah Jenkins', role: 'Director', status: 'confirmed', dailyRate: 1500 },
  { id: 'c2', name: 'Mike Chen', role: 'DOP', status: 'confirmed', dailyRate: 1200 },
  { id: 'c3', name: 'Jessica Wu', role: '1st AC', status: 'confirmed', dailyRate: 600 },
  { id: 'c4', name: 'Tom Baker', role: 'Gaffer', status: 'pending', dailyRate: 550 },
];
