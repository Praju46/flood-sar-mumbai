# Urban Flood Extent Mapping using Sentinel-1 SAR (Mumbai)

This repository contains workflows, scripts, and documentation for
urban flood inundation mapping using multi-polarised Sentinel-1 SAR data.
The study focuses on delineating flood extent in dense urban environments
with emphasis on automated and reproducible methods.

---

## Project Overview

Urban flooding poses significant challenges in megacities due to
impervious surfaces, complex drainage networks, and dense built-up areas.
Synthetic Aperture Radar (SAR) data is particularly suitable for flood
mapping because of its cloud-penetrating capability and day–night imaging.

This project utilizes Sentinel-1 SAR data to identify flood-affected
areas in Mumbai during extreme rainfall events.

---

## Objectives

- Delineate urban flood extents using Sentinel-1 SAR imagery.
- Evaluate the role of SAR polarization in urban flood detection using 10 different polarization combinations.
- Develop an automated flood mapping workflow.
- Validate flood extent using field observations and secondary data.

---

## Data Used

- Sentinel-1 SAR data (VV and VH polarization)
- JRC Water layer,Hydrosheds DEM
- Administrative boundaries and urban land-use data
- LISS 4 and Planet scope data for validation

---

## Methodology

1. Acquisition of pre- and post-flood Sentinel-1 SAR images.
2. Radiometric calibration and speckle filtering.
3. Change detection and threshold-based flood extraction.
4. Post-processing to remove noise and non-flooded features.
5. Validation using field data and reference datasets.

---

## Tools & Technologies

- Google Earth Engine (GEE)
- Python
- ArcGIS / QGIS
- Remote sensing and GIS techniques

---

## Outputs

- Urban flood extent maps
- Binary flood inundation layers
- Summary statistics and spatial analysis outputs

---
## How to Run (Google Earth Engine)
1. Open the script from `gee/flood_mapping_mumbai.js`
2. Copy-paste into GEE Code Editor
3. Set Mumbai boundary (ROI)
4. Set pre-flood and post-flood dates
5. Run the script
6. Export flood extent results to Drive


## Status

This work forms the basis of a **journal manuscript currently under review**
and additional documentation and scripts will be updated progressively.

---



