# DetectNode

On-camera edge AI application for (ARTPEC-8 / ARTPEC-9 with AXIS OS 12.10-12.x.x) cameras. 
DetectNode turns an Axis camera into a configurable vision node that runs local inference, tracks objects, evaluates spatial rules, and publishes real-time alarms and telemetry.

- **Website:** [DetectNode.github.io](https://github.com/DetectNode/DetectNode.github.io "null")
    
- **Example models:** [example-models](https://github.com/DetectNode/example-models "null")
    
- **Training guides:** [training-guides](https://github.com/DetectNode/training-guides "null")
    

> **Project Status:** DetectNode is a personal project in active development, provided as a trial pre-release. It is not industrial or production-ready, and comes with no warranty.

## Features

- Supports running multiple models concurrently across single or multiple view areas and scenarios.

- **Model Agnostic:** Runs object detection, PaDiM anomaly detection, and semantic segmentation via a model description file.

- **On-Camera Tracking & Analysis:** Multi-object tracking with normalized geometry (resolution-independent) and 6 virtual sensors (gauge, fill ratio, altitude, blob count, crossing/contact, presence/dwell).

- **Rule Engine & Logic:** Evaluates conditions (duration, hysteresis, boolean logic, custom formulas) and triggers clean state-transition events to eliminate duplicate alerts.

- **Flexible Routing:** Out-of-the-box support for MQTT, HTTP (with JPEG/crop payloads), native Axis events, and an embedded web dashboard.

- **Resource Efficient:** Single video feed and single inference pass shared across multiple active scenarios.


## Architecture

DetectNode uses a two-process architecture to ensure the web interface and event engine remain responsive during heavy inference workloads or model reloads:

```
┌─────────────────────────────────────────────────────────────────────┐
│ Axis Camera                                                         │
│                                                                     │
│  Main Process                                                       │
│  └─ Capture, Orchestration, Tracking, Rules, Outputs, Web UI/API    │
│                                  │                                  │
│                                  ▼ binary IPC                       │
│  Inference Worker Process                                           │
│  └─ Model loading, Preprocessing, CPU/DLPU Inference, Tensor Parsing │
└─────────────────────────────────────────────────────────────────────┘
```

## Supported Model Families

|   |   |   |
|---|---|---|
|**Family**|**Model Output**|**DetectNode Action**|
|**Object Detection**|Bounding boxes, classes, confidence|Tracking, counts, zone/line rules|
|**Anomaly Detection**|PaDiM heatmap / image score|Heatmap overlay, normalized score, threshold events|
|**Semantic Segmentation**|Per-pixel class mask|Mask overlay, fill ratio, altitude, blob counting|

_Note: Models run on CPU or DLPU depending on hardware compatibility declared in the model package._

## Storage Layout (SD Card)

Local storage is used for persistent crossing counters (survives restarts) and historical timeline browsing.

```
detectnode/
├── meta.json                              # Archive metadata
├── events/<cam>/<analysis>/<date>/        # Event payloads (.json) & snapshots (.jpg)
├── samples/<cam>/<analysis>/<date>.ndjson # Periodic telemetry (independent size limit)
├── state/<cam>.json                       # Persisted cumulative counters (never pruned)
└── _unmatched/                            # Unrecognized files reported in UI
```

## Model Packaging & Security

- **Packages:** Bundle weights, labels, and the parsing description file into a single deployable unit.
    
- **Ed25519 Signing:** Model packages can be signed for provenance verification (marked as verified in the UI). Unsigned models remain supported.
    
- **Access & Network:** Relies on native Axis administrator authentication. Deploy MQTT output within trusted networks or behind secure gateways.
    

## Web Interface

- Live video stream with overlays & interactive scenario setup (guided drawing/calibration).
    
- Dataset capture for offline anomaly model training.
    
- Historical data browser, charts, and data export.
    
- Complete system configuration—no command-line access required.
    

## License

Distributed under the **PolyForm Free Trial License 1.0.0**. See the internal application page for third-party notices.

_DetectNode is an independent project and is not affiliated with Axis Communications._
