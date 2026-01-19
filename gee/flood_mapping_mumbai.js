// Select images by predefined dates
var beforeStart = '2021-06-08';
var beforeEnd = '2021-06-10';
var afterStart = '2021-07-27';
var afterEnd = '2021-07-28';


Map.addLayer(flooded_areas)

var mumbai_city = ee.FeatureCollection("projects/projectworkflow-388616/assets/AOI");
var geometry = mumbai_city.geometry();
Map.addLayer(geometry, {color: 'grey'}, 'Mumbai District');

var collection = ee.ImageCollection('COPERNICUS/S1_GRD')
  .filter(ee.Filter.eq('instrumentMode', 'IW'))
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
 // .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH')) // Add VH polarization
  .filter(ee.Filter.eq('orbitProperties_pass', 'DESCENDING'))
  .filter(ee.Filter.eq('resolution_meters', 10))
  .filterBounds(geometry)
 // .select(['VV', 'VH']); // Select VH + VV bands

print(collection);

 // Create different polarisation combinations
var VH = collection.select('VH');
var VV = collection.select('VV');

// Combine VV and VH bands

var addBandsAndSum = function(image) {
  var vv = image.select('VV');
  var vh = image.select('VH');
  var sum = vh.add(vv);
  return image.addBands(sum.rename('VV_VH_Sum'));
};


// Apply the addBandsAndSum function to the ImageCollection
var combinedCollection = collection.map(addBandsAndSum);

var beforeCollection = combinedCollection.filterDate(beforeStart, beforeEnd);
var afterCollection = combinedCollection .filterDate(afterStart, afterEnd);

var before = beforeCollection.select('VV_VH_Sum').mosaic().clip(geometry);
var after = afterCollection.select('VV_VH_Sum').mosaic().clip(geometry);

print(before);
print(after);





// Define the collection of latitude and longitude coordinates
var urban_HighRise_Coordinates = [
  {latitude: 19.060486, longitude: 72.865483}, // Replace with the desired latitude and longitude
  {latitude: 19.083045, longitude: 72.839854}, // Replace with additional coordinates if needed
  {latitude: 19.0630594, longitude: 72.8619964},
  {latitude: 19.0627147, longitude: 72.8610093},
  {latitude: 19.2438572, longitude: 73.1276472},
  {latitude: 19.242306, longitude: 73.129164},
  {latitude: 19.2434687, longitude: 73.1239112},
  {latitude: 19.252501, longitude: 73.131601},
  {latitude: 19.0600666, longitude: 72.8310106},
  {latitude: 19.253721, longitude:73.136267},
  {latitude: 19.25287, longitude: 73.140837},
  {latitude: 19.255595, longitude: 73.138209}
];


// Create an empty list to store the results
var urban_HighRise_backscatterList_before = [];
var urban_HighRise_backscatterList_after = [];

// Loop over each coordinate
for (var i = 0; i < urban_HighRise_Coordinates.length; i++) {
  var coord1 = urban_HighRise_Coordinates[i];
  var latitude = coord1.latitude;
  var longitude = coord1.longitude;

  // Create a point geometry from the latitude and longitude
  var point1 = ee.Geometry.Point(longitude, latitude);

  // Get the backscatter value at the specified point before the flood
  var image1 = ee.Image(beforeCollection.median());
  var backscatter_beforeFlood = image1.select('VV_VH_Sum') // Replace 'VV_VH_Sum' with the desired polarization
    .reduceRegion({
      reducer: ee.Reducer.first(),
      geometry: point1,
      scale: 10 // Adjust the scale according to your requirements
    })
    .get('VV_VH_Sum');
  
  // Get the backscatter value at the specified point after the flood
  var image2 = ee.Image(afterCollection.median());
  var backscatter_afterFlood = image2.select('VV_VH_Sum') // Replace 'VH' with the desired polarization
    .reduceRegion({
      reducer: ee.Reducer.first(),
      geometry: point1,
      scale: 10 // Adjust the scale according to your requirements
    })
    .get('VV_VH_Sum');

  // Add the backscatter values to the lists
  urban_HighRise_backscatterList_before.push(backscatter_beforeFlood);
  urban_HighRise_backscatterList_after.push(backscatter_afterFlood);
}

// Create an array of dates or labels for the x-axis (assuming there is one value per coordinate)
var urban_HighRise_Labels = urban_HighRise_Coordinates.map(function(_, index) {
  return index + 1;
});

// Create an array of backscatter values for the y-axis
var urban_HighRise_values_before= urban_HighRise_backscatterList_before.map(function(value) {
  return ee.Number(value);
});

var urban_HighRise_values_after = urban_HighRise_backscatterList_after.map(function(value) {
  return ee.Number(value);
});

// Combine the arrays for the line chart
var chartData = ee.Array.cat([urban_HighRise_values_before, urban_HighRise_values_after],1);

// Create a chart from the backscatter values
var chart1 = ui.Chart.array.values({
  array: chartData,
  axis: 0,
  xLabels:urban_HighRise_Labels
}).setChartType('LineChart')
  .setOptions({
    title: 'Urban HighRise Backscatter Before and After Flood',
    hAxis: {title: 'Coordinates'},
    vAxis: {title: 'Backscatter'},
    series: {
       0: {color: 'green', lineWidth: 1, pointSize: 3, label: 'Before Flood'},
      1: {color: 'Yellow', lineWidth: 1, pointSize: 3, label: 'After Flood'}
    },
    legend: {position: 'top', alignment: 'end'}
  });

// Display the chart in the console
print(chart1);


// Define the collection of coordinates for water pixels
var urban_LowRise_Coordinates = [
  {latitude:  19.3386183, longitude: 73.4292479},
  {latitude: 19.297984, longitude: 73.148415},
  {latitude: 19.3293103, longitude: 73.3754394},
  {latitude: 19.3305539, longitude:73.3750957},//open areas
  {latitude: 19.3229959, longitude: 73.3408979},
  {latitude: 19.2971632, longitude: 73.2057324},
  {latitude: 19.2960069, longitude: 73.2058684},//high rise
  {latitude: 19.2962369, longitude: 73.2004676},
  {latitude: 19.2964027, longitude: 73.2031364},
  {latitude: 19.296805, longitude: 73.184095},
  {latitude: 19.2995439, longitude: 73.1688028},
  {latitude: 19.2970951, longitude: 73.1611643},

];

// Create an empty list to store the results
var urban_LowRise_backscatterList_before = [];
var urban_LowRise_backscatterList_after = [];

// Loop over each coordinate
for (var i = 0; i < urban_LowRise_Coordinates.length; i++) {
  var coord2 = urban_LowRise_Coordinates[i];
  var latitude = coord2.latitude;
  var longitude = coord2.longitude;

  // Create a point geometry from the latitude and longitude
  var point2 = ee.Geometry.Point(longitude, latitude);

  // Get the backscatter value at the specified point before the flood
  var backscatter_beforeFlood = image1.select('VV_VH_Sum') // Replace 'VH' with the desired polarization
    .reduceRegion({
      reducer: ee.Reducer.first(),
      geometry: point2,
      scale: 10 // Adjust the scale according to your requirements
    })
    .get('VV_VH_Sum');
  
  // Get the backscatter value at the specified point after the flood

  var backscatter_afterFlood = image2.select('VV_VH_Sum') // Replace 'VH' with the desired polarization
    .reduceRegion({
      reducer: ee.Reducer.first(),
      geometry: point2,
      scale: 10 // Adjust the scale according to your requirements
    })
    .get('VV_VH_Sum');

  // Add the backscatter values to the lists
  urban_LowRise_backscatterList_before.push(backscatter_beforeFlood);
  urban_LowRise_backscatterList_after.push(backscatter_afterFlood);
}

/// Create an array of labels for the x-axis for urban non-flooded areas
var urban_LowRise_floodedLabels = urban_LowRise_Coordinates.map(function(_, index) {
  return index + 1;
});

// Create an array of backscatter values for the y-axis
var values_before_nonflooded = urban_LowRise_backscatterList_before.map(function(value) {
  return ee.Number(value);
});

var values_after_nonflooded = urban_LowRise_backscatterList_after.map(function(value) {
  return ee.Number(value);
});

// Combine the arrays for the line chart
var chartData2 = ee.Array.cat([values_before_nonflooded, values_after_nonflooded],1);

// Create a chart from the backscatter values
var chart2 = ui.Chart.array.values({
  array: chartData2,
  axis: 0,
  xLabels: urban_LowRise_floodedLabels
}).setChartType('LineChart')
  .setOptions({
    title: 'Urban Low Rise Backscatter Before and After Flood',
    hAxis: {title: 'Coordinates'},
    vAxis: {title: 'Backscatter'},
    series: {
       0: {color: 'blue', lineWidth: 2, pointSize: 3, label: 'Before Flood'},
      1: {color: 'red', lineWidth: 2, pointSize: 3, label: 'After Flood'}
    },
    legend: {position: 'top', alignment: 'end'}
  });

// Display the chart in the console
print(chart2);


// Define the collection of latitude and longitude coordinates
var Water_Coordinates = [
  {latitude: 19.048758, longitude: 72.841318}, // Replace with the desired latitude and longitude
  {latitude: 19.057125, longitude: 72.837486}, // Replace with additional coordinates if needed
  {latitude: 19.055127, longitude: 72.866254},
  {latitude:19.124879, longitude: 72.903057},
  {latitude: 19.19922, longitude: 73.34644},
  {latitude: 19.250968, longitude: 73.115377},
  {latitude: 19.279997, longitude: 73.059865},
  {latitude: 19.3277791, longitude:73.0720295},
  {latitude: 19.470292, longitude: 73.011166},
  {latitude: 19.486333, longitude:73.085671},
  {latitude: 19.463232, longitude: 73.126952},
  {latitude:19.431644, longitude: 73.151967}
];


// Create an empty list to store the results
var Water_backscatterList_before = [];
var Water_backscatterList_after = [];

// Loop over each coordinate
for (var i = 0; i < Water_Coordinates.length; i++) {
  var coord3 = Water_Coordinates[i];
  var latitude = coord3.latitude;
  var longitude = coord3.longitude;

  // Create a point geometry from the latitude and longitude
  var point3 = ee.Geometry.Point(longitude, latitude);

  // Get the backscatter value at the specified point before the flood
 
  var backscatter_beforeFlood = image1.select('VV_VH_Sum') // Replace 'VH' with the desired polarization
    .reduceRegion({
      reducer: ee.Reducer.first(),
      geometry: point3,
      scale: 10 // Adjust the scale according to your requirements
    })
    .get('VV_VH_Sum');
  
  // Get the backscatter value at the specified point after the flood
  
  var backscatter_afterFlood = image2.select('VV_VH_Sum') // Replace 'VH' with the desired polarization
    .reduceRegion({
      reducer: ee.Reducer.first(),
      geometry: point3,
      scale: 10 // Adjust the scale according to your requirements
    })
    .get('VV_VH_Sum');

  // Add the backscatter values to the lists
  Water_backscatterList_before.push(backscatter_beforeFlood);
  Water_backscatterList_after.push(backscatter_afterFlood);
}

// Create an array of dates or labels for the x-axis (assuming there is one value per coordinate)
var water_Labels = Water_Coordinates.map(function(_, index) {
  return index + 1;
});

// Create an array of backscatter values for the y-axis
var water_values_before= Water_backscatterList_before.map(function(value) {
  return ee.Number(value);
});

var water_values_after = Water_backscatterList_after.map(function(value) {
  return ee.Number(value);
});

// Combine the arrays for the line chart
var chartData = ee.Array.cat([water_values_before, water_values_after],1);

// Create a chart from the backscatter values
var chart3 = ui.Chart.array.values({
  array: chartData,
  axis: 0,
  xLabels:water_Labels
}).setChartType('LineChart')
  .setOptions({
    title: 'Water Backscatter Before and After Flood',
    hAxis: {title: 'Coordinates'},
    vAxis: {title: 'Backscatter'},
    series: {
       0: {color: 'pink', lineWidth: 1, pointSize: 3, label: 'Before Flood'},
      1: {color: 'Yellow', lineWidth: 1, pointSize: 3, label: 'After Flood'}
    },
    legend: {position: 'top', alignment: 'end'}
  });

// Display the chart in the console
print(chart3);


// Define the collection of latitude and longitude coordinates
var Open_areas_Coordinates = [
  {latitude: 19.0731987, longitude: 72.8525852}, // Replace with the desired latitude and longitude
  {latitude: 19.076877, longitude: 72.855852}, // Replace with additional coordinates if needed
  {latitude: 19.0770442, longitude: 72.8610748},
  {latitude:19.084307, longitude: 72.860535},
  {latitude: 19.077465, longitude: 72.869418},
  {latitude: 19.0760357, longitude: 72.8703274},
  {latitude: 19.239195, longitude: 73.152809},//
  {latitude: 19.24927, longitude:73.150999},
  {latitude: 19.2359438, longitude: 73.1192308},
  {latitude: 19.238947, longitude:73.121387},
  {latitude: 19.241298, longitude: 73.12724},
  {latitude:19.238072, longitude: 73.14818}
];


// Create an empty list to store the results
var Open_areas_backscatterList_before = [];
var Open_areas_backscatterList_after = [];

// Loop over each coordinate
for (var i = 0; i < Open_areas_Coordinates.length; i++) {
  var coord4 = Open_areas_Coordinates[i];
  var latitude = coord4.latitude;
  var longitude = coord4.longitude;

  // Create a point geometry from the latitude and longitude
  var point4 = ee.Geometry.Point(longitude, latitude);

  // Get the backscatter value at the specified point before the flood
 
  var backscatter_beforeFlood = image1.select('VV_VH_Sum') // Replace 'VH' with the desired polarization
    .reduceRegion({
      reducer: ee.Reducer.first(),
      geometry: point4,
      scale: 10 // Adjust the scale according to your requirements
    })
    .get('VV_VH_Sum');
  
  // Get the backscatter value at the specified point after the flood
  
  var backscatter_afterFlood = image2.select('VV_VH_Sum') // Replace 'VH' with the desired polarization
    .reduceRegion({
      reducer: ee.Reducer.first(),
      geometry: point4,
      scale: 10 // Adjust the scale according to your requirements
    })
    .get('VV_VH_Sum');

  // Add the backscatter values to the lists
  Open_areas_backscatterList_before.push(backscatter_beforeFlood);
  Open_areas_backscatterList_after.push(backscatter_afterFlood);
}

// Create an array of dates or labels for the x-axis (assuming there is one value per coordinate)
var Open_areas_Labels = Open_areas_Coordinates.map(function(_, index) {
  return index + 1;
});

// Create an array of backscatter values for the y-axis
var Open_areas_values_before= Open_areas_backscatterList_before.map(function(value) {
  return ee.Number(value);
});

var Open_areas_values_after = Open_areas_backscatterList_after.map(function(value) {
  return ee.Number(value);
});

// Combine the arrays for the line chart
var chartData = ee.Array.cat([Open_areas_values_before, Open_areas_values_after],1);

// Create a chart from the backscatter values
var chart4 = ui.Chart.array.values({
  array: chartData,
  axis: 0,
  xLabels:Open_areas_Labels
}).setChartType('LineChart')
  .setOptions({
    title: 'Open Areas Backscatter Before and After Flood',
    hAxis: {title: 'Coordinates'},
    vAxis: {title: 'Backscatter'},
    series: {
       0: {color: 'red', lineWidth: 1, pointSize: 3, label: 'Before Flood'},
      1: {color: 'Yellow', lineWidth: 1, pointSize: 3, label: 'After Flood'}
    },
    legend: {position: 'top', alignment: 'end'}
  });

// Display the chart in the console
print(chart4);


// Define the collection of latitude and longitude coordinates
var Agricultural_areas_Coordinates = [
  {latitude: 19.1709601, longitude: 73.0608864}, // Replace with the desired latitude and longitude
  {latitude: 19.238319, longitude:73.149617}, // Replace with additional coordinates if needed
  {latitude: 19.215945, longitude: 73.036075},
  {latitude:19.214598, longitude: 73.031721},
  {latitude: 19.170726, longitude: 73.061777},
  {latitude: 19.16771, longitude:73.25578},
  {latitude: 19.2061231, longitude: 73.1498186},//
  {latitude: 19.168656, longitude:73.064329},
  {latitude: 19.1581532, longitude: 73.0518807},
  {latitude: 19.2319, longitude:73.063573},
  {latitude: 19.2297049, longitude: 73.0615091},
  {latitude:19.1870485, longitude: 73.0815862}
];


// Create an empty list to store the results
var Agricultural_areas_backscatterList_before = [];
var Agricultural_areas_backscatterList_after = [];

// Loop over each coordinate
for (var i = 0; i < Agricultural_areas_Coordinates.length; i++) {
  var coord5 = Agricultural_areas_Coordinates[i];
  var latitude = coord5.latitude;
  var longitude = coord5.longitude;

  // Create a point geometry from the latitude and longitude
  var point5 = ee.Geometry.Point(longitude, latitude);

  // Get the backscatter value at the specified point before the flood
 
  var backscatter_beforeFlood = image1.select('VV_VH_Sum') // Replace 'VH' with the desired polarization
    .reduceRegion({
      reducer: ee.Reducer.first(),
      geometry: point5,
      scale: 10 // Adjust the scale according to your requirements
    })
    .get('VV_VH_Sum');
  
  // Get the backscatter value at the specified point after the flood
  
  var backscatter_afterFlood = image2.select('VV_VH_Sum') // Replace 'VH' with the desired polarization
    .reduceRegion({
      reducer: ee.Reducer.first(),
      geometry: point5,
      scale: 10 // Adjust the scale according to your requirements
    })
    .get('VV_VH_Sum');

  // Add the backscatter values to the lists
  Agricultural_areas_backscatterList_before.push(backscatter_beforeFlood);
  Agricultural_areas_backscatterList_after.push(backscatter_afterFlood);
}

// Create an array of dates or labels for the x-axis (assuming there is one value per coordinate)
var Agri_areas_Labels = Agricultural_areas_Coordinates.map(function(_, index) {
  return index + 1;
});

// Create an array of backscatter values for the y-axis
var Agri_areas_values_before= Agricultural_areas_backscatterList_before.map(function(value) {
  return ee.Number(value);
});

var Agri_areas_values_after = Agricultural_areas_backscatterList_after.map(function(value) {
  return ee.Number(value);
});

// Combine the arrays for the line chart
var chartData = ee.Array.cat([Agri_areas_values_before, Agri_areas_values_after],1);

// Create a chart from the backscatter values
var chart5 = ui.Chart.array.values({
  array: chartData,
  axis: 0,
  xLabels:Agri_areas_Labels
}).setChartType('LineChart')
  .setOptions({
    title: 'Agricultural Areas Backscatter Before and After Flood',
    hAxis: {title: 'Coordinates'},
    vAxis: {title: 'Backscatter'},
    series: {
       0: {color: 'blue', lineWidth: 1, pointSize: 3, label: 'Before Flood'},
      1: {color: 'Yellow', lineWidth: 1, pointSize: 3, label: 'After Flood'}
    },
    legend: {position: 'top', alignment: 'end'}
  });

// Display the chart in the console
print(chart5);



Map.addLayer(before, {min: -25, max: 0}, 'Before Floods', false);
Map.addLayer(after, {min: -25, max: 0}, 'After Floods', false);

var beforeFiltered = ee.Image(toDB(RefinedLee(toNatural(before))));
var afterFiltered = ee.Image(toDB(RefinedLee(toNatural(after))));

Map.addLayer(beforeFiltered, {min: -25, max: 0}, 'Before Filtered', false);
Map.addLayer(afterFiltered, {min: -25, max: 0}, 'After Filtered', false);


// Create histograms for before and after filtered images
var histogramBefore = ui.Chart.image.histogram(beforeFiltered, geometry, 30);
var histogramAfter = ui.Chart.image.histogram(afterFiltered, geometry, 30);

// print(histogramBefore)
// print(histogramAfter)
// Customize the chart properties
histogramBefore = histogramBefore.setOptions({
  title: 'Histogram - Before Floods',
  hAxis: { title: 'Pixel Value' },
  vAxis: { title: 'Count' },
});
histogramAfter = histogramAfter.setOptions({
  title: 'Histogram - After Floods',
  hAxis: { title: 'Pixel Value' },
  vAxis: { title: 'Count' },
});

// Display the histograms
print(histogramBefore);
print(histogramAfter);

var difference = afterFiltered.divide(beforeFiltered);

// Define a threshold
var diffThreshold = 1.25;
// Initial estimate of flooded pixels
var flooded = difference.gt(diffThreshold).rename('water').selfMask();
Map.addLayer(flooded, {min:0, max:1, palette: ['orange']}, 'Initial Flood Area', false);


// Mask out area with permanent/semi-permanent water
var permanentWater = gsw.select('seasonality').gte(10).clip(geometry)
var flooded = flooded.where(permanentWater, 0).selfMask()
Map.addLayer(permanentWater.selfMask(), {min:0, max:1, palette: ['blue']}, 'Permanent Water')

// Mask out areas with more than 5 percent slope using the HydroSHEDS DEM
var slopeThreshold = 5;
var terrain = ee.Algorithms.Terrain(hydrosheds);
var slope = terrain.select('slope');
var flooded = flooded.updateMask(slope.lt(slopeThreshold));
Map.addLayer(slope.gte(slopeThreshold).selfMask(), {min:0, max:1, palette: ['cyan']}, 'Steep Areas', false)

        
// Remove isolated pixels
// connectedPixelCount is Zoom dependent, so visual result will vary
var connectedPixelThreshold = 8;
var connections = flooded.connectedPixelCount(25)
var flooded = flooded.updateMask(connections.gt(connectedPixelThreshold))
Map.addLayer(connections.lte(connectedPixelThreshold).selfMask(), {min:0, max:1, palette: ['yellow']}, 'Disconnected Areas', false)

Map.addLayer(flooded, {min:0, max:1, palette: ['red']}, 'Flooded Areas');

// Calculate Affected Area
print('Total District Area (Ha)', geometry.area().divide(10000))

var stats = flooded.multiply(ee.Image.pixelArea()).reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: geometry,
  scale: 30,
  maxPixels: 1e10,
  tileScale: 16
})
print('Flooded Area (Ha)', ee.Number(stats.get('water')).divide(10000))

// If the above computation times out, you can export it
var flooded_area = ee.Number(stats.get('water')).divide(10000);
var feature = ee.Feature(null, {'flooded_area': flooded_area})
var fc = ee.FeatureCollection([feature])

Export.table.toDrive({
  collection: fc, 
  description: 'Flooded_Area_Export',
  folder: 'earthengine',
  fileNamePrefix: 'flooded_area',
  fileFormat: 'CSV'})

//export the image.specifying scale and region.
Export.image.toDrive({
  image:before,
  description:'Change_Detection_Addition_before',
  scale:10,
  region:geometry,
  maxPixels:1e11
});

//export the image.specifying scale and region.
Export.image.toDrive({
  image:after,
  description:'Change_Detection_Addition_after',
  scale:10,
  region:geometry,
  maxPixels:1e11
});

//export the image.specifying scale and region.
Export.image.toDrive({
  image:permanentWater,
  description:'Change_Detection_Addition_permanentWater',
  scale:10,
  region:geometry,
  maxPixels:1e11
});

//export the image.specifying scale and region.
Export.image.toDrive({
  image:flooded,
  description:'Change_Detection_Addition_flooded',
  scale:10,
  region:geometry,
  maxPixels:1e11
});

// Convert flood raster to polygons
var flooded_vec = flooded.reduceToVectors({
  scale: 10,
  geometryType:'polygon',
  geometry: geometry,
  eightConnected: false,
  bestEffort:true,
  tileScale:2,
});

// Export flood polygons as shape-file
Export.table.toDrive({
  collection:flooded_vec,
  description:'Flood_extent_vector_Addition',
  fileFormat:'SHP',
  fileNamePrefix:'flooded_vec_Addition'
});

var label = 'Class';
// Sample the Sentinel-1 data at the training points
var training = after.sampleRegions({
  collection: points,
  properties: [label],
  scale: 10
});

var trainingData = training.randomColumn();
var trainSet = trainingData.filter(ee.Filter.lessThan('random', 0.8));
var testSet = trainingData.filter(ee.Filter.greaterThanOrEquals('random', 0.8));



// //Define the classifier (uncomment the following lines)
 var classifier = ee.Classifier.smileRandomForest(10).train(trainSet, label);

// Classify the test set using the trained classifier
var classifiedTestSet = testSet.classify( classifier);

// Create a confusion matrix using ground truth and predicted values
var confusionMatrix = classifiedTestSet.errorMatrix(label,'Flooded Areas');

// Calculate overall accuracy.
print("Overall accuracy:", confusionMatrix.accuracy());

// Consumer's accuracy (user's accuracy)
print("User's accuracy:", confusionMatrix.consumersAccuracy());

// Producer's accuracy
print("Producer's accuracy:", confusionMatrix.producersAccuracy());

// Kappa statistic
print('Kappa statistic:', confusionMatrix.kappa());



// // Load the ground truth data (shapefile) as a FeatureCollection
// var groundTruth = ee.FeatureCollection('projects/projectworkflow-388616/assets/Flooded_locations');


// // Function to calculate accuracy metrics for each ground truth point
// var accuracyMetrics = function (feature) {
//   // Extract the value of the flooded layer at the ground truth point location
//   var floodedValue = flooded.reduceRegion({
//     reducer: ee.Reducer.first(),
//     geometry: feature.geometry(),
//     scale: 30, // Adjust the scale accordingly
//     maxPixels: 1e9
//   }).getNumber('constant');

//   // Ground truth class (actual flooded value)
//   var groundTruthClass = ee.Number(feature.get('class'));

//   // Check if the predicted value matches the ground truth value (1 for flooded, 0 for non-flooded)
//   var accuracy = floodedValue.eq(groundTruthClass); // True if the prediction matches the ground truth, false otherwise

//   return feature.set('accuracy', accuracy);
// };

// // Map the accuracyMetrics function over the ground truth data
// var accuracyAssessment = groundTruth.map(accuracyMetrics);

// // Calculate overall accuracy
// var overallAccuracy = accuracyAssessment.aggregate_mean('accuracy');

// // Print the accuracy assessment results
// print('Accuracy Assessment Results:', accuracyAssessment);
// print('Overall Accuracy:', overallAccuracy);

// // Export the results as a CSV
// Export.table.toDrive({
//   collection: accuracyAssessment,
//   description: 'accuracy_assessment_results',
//   fileFormat: 'CSV'
// });


//############################
// Speckle Filtering Functions
//############################

// Function to convert from dB
function toNatural(img) {
  return ee.Image(10.0).pow(img.select(0).divide(10.0));
}

//Function to convert to dB
function toDB(img) {
  return ee.Image(img).log10().multiply(10.0);
}

//Apllying a Refined Lee Speckle filter as coded in the SNAP 3.0 S1TBX:

//https://github.com/senbox-org/s1tbx/blob/master/s1tbx-op-sar-processing/src/main/java/org/esa/s1tbx/sar/gpf/filtering/SpeckleFilters/RefinedLee.java
//Adapted by Guido Lemoine

// by Guido Lemoine
function RefinedLee(img) {
  // img must be in natural units, i.e. not in dB!
  // Set up 3x3 kernels 
  var weights3 = ee.List.repeat(ee.List.repeat(1,3),3);
  var kernel3 = ee.Kernel.fixed(3,3, weights3, 1, 1, false);

  var mean3 = img.reduceNeighborhood(ee.Reducer.mean(), kernel3);
  var variance3 = img.reduceNeighborhood(ee.Reducer.variance(), kernel3);

  // Use a sample of the 3x3 windows inside a 7x7 windows to determine gradients and directions
  var sample_weights = ee.List([[0,0,0,0,0,0,0], [0,1,0,1,0,1,0],[0,0,0,0,0,0,0], [0,1,0,1,0,1,0], [0,0,0,0,0,0,0], [0,1,0,1,0,1,0],[0,0,0,0,0,0,0]]);

  var sample_kernel = ee.Kernel.fixed(7,7, sample_weights, 3,3, false);

  // Calculate mean and variance for the sampled windows and store as 9 bands
  var sample_mean = mean3.neighborhoodToBands(sample_kernel); 
  var sample_var = variance3.neighborhoodToBands(sample_kernel);

  // Determine the 4 gradients for the sampled windows
  var gradients = sample_mean.select(1).subtract(sample_mean.select(7)).abs();
  gradients = gradients.addBands(sample_mean.select(6).subtract(sample_mean.select(2)).abs());
  gradients = gradients.addBands(sample_mean.select(3).subtract(sample_mean.select(5)).abs());
  gradients = gradients.addBands(sample_mean.select(0).subtract(sample_mean.select(8)).abs());

  // And find the maximum gradient amongst gradient bands
  var max_gradient = gradients.reduce(ee.Reducer.max());

  // Create a mask for band pixels that are the maximum gradient
  var gradmask = gradients.eq(max_gradient);

  // duplicate gradmask bands: each gradient represents 2 directions
  gradmask = gradmask.addBands(gradmask);

  // Determine the 8 directions
  var directions = sample_mean.select(1).subtract(sample_mean.select(4)).gt(sample_mean.select(4).subtract(sample_mean.select(7))).multiply(1);
  directions = directions.addBands(sample_mean.select(6).subtract(sample_mean.select(4)).gt(sample_mean.select(4).subtract(sample_mean.select(2))).multiply(2));
  directions = directions.addBands(sample_mean.select(3).subtract(sample_mean.select(4)).gt(sample_mean.select(4).subtract(sample_mean.select(5))).multiply(3));
  directions = directions.addBands(sample_mean.select(0).subtract(sample_mean.select(4)).gt(sample_mean.select(4).subtract(sample_mean.select(8))).multiply(4));
  // The next 4 are the not() of the previous 4
  directions = directions.addBands(directions.select(0).not().multiply(5));
  directions = directions.addBands(directions.select(1).not().multiply(6));
  directions = directions.addBands(directions.select(2).not().multiply(7));
  directions = directions.addBands(directions.select(3).not().multiply(8));

  // Mask all values that are not 1-8
  directions = directions.updateMask(gradmask);

  // "collapse" the stack into a singe band image (due to masking, each pixel has just one value (1-8) in it's directional band, and is otherwise masked)
  directions = directions.reduce(ee.Reducer.sum());  

  //var pal = ['ffffff','ff0000','ffff00', '00ff00', '00ffff', '0000ff', 'ff00ff', '000000'];
  //Map.addLayer(directions.reduce(ee.Reducer.sum()), {min:1, max:8, palette: pal}, 'Directions', false);

  var sample_stats = sample_var.divide(sample_mean.multiply(sample_mean));

  // Calculate localNoiseVariance
  var sigmaV = sample_stats.toArray().arraySort().arraySlice(0,0,5).arrayReduce(ee.Reducer.mean(), [0]);

  // Set up the 7*7 kernels for directional statistics
  var rect_weights = ee.List.repeat(ee.List.repeat(0,7),3).cat(ee.List.repeat(ee.List.repeat(1,7),4));

  var diag_weights = ee.List([[1,0,0,0,0,0,0], [1,1,0,0,0,0,0], [1,1,1,0,0,0,0], 
    [1,1,1,1,0,0,0], [1,1,1,1,1,0,0], [1,1,1,1,1,1,0], [1,1,1,1,1,1,1]]);

  var rect_kernel = ee.Kernel.fixed(7,7, rect_weights, 3, 3, false);
  var diag_kernel = ee.Kernel.fixed(7,7, diag_weights, 3, 3, false);

  // Create stacks for mean and variance using the original kernels. Mask with relevant direction.
  var dir_mean = img.reduceNeighborhood(ee.Reducer.mean(), rect_kernel).updateMask(directions.eq(1));
  var dir_var = img.reduceNeighborhood(ee.Reducer.variance(), rect_kernel).updateMask(directions.eq(1));

  dir_mean = dir_mean.addBands(img.reduceNeighborhood(ee.Reducer.mean(), diag_kernel).updateMask(directions.eq(2)));
  dir_var = dir_var.addBands(img.reduceNeighborhood(ee.Reducer.variance(), diag_kernel).updateMask(directions.eq(2)));

  // and add the bands for rotated kernels
  for (var i=1; i<4; i++) {
    dir_mean = dir_mean.addBands(img.reduceNeighborhood(ee.Reducer.mean(), rect_kernel.rotate(i)).updateMask(directions.eq(2*i+1)));
    dir_var = dir_var.addBands(img.reduceNeighborhood(ee.Reducer.variance(), rect_kernel.rotate(i)).updateMask(directions.eq(2*i+1)));
    dir_mean = dir_mean.addBands(img.reduceNeighborhood(ee.Reducer.mean(), diag_kernel.rotate(i)).updateMask(directions.eq(2*i+2)));
    dir_var = dir_var.addBands(img.reduceNeighborhood(ee.Reducer.variance(), diag_kernel.rotate(i)).updateMask(directions.eq(2*i+2)));
  }

  // "collapse" the stack into a single band image (due to masking, each pixel has just one value in it's directional band, and is otherwise masked)
  dir_mean = dir_mean.reduce(ee.Reducer.sum());
  dir_var = dir_var.reduce(ee.Reducer.sum());

  // A finally generate the filtered value
  var varX = dir_var.subtract(dir_mean.multiply(dir_mean).multiply(sigmaV)).divide(sigmaV.add(1.0));

  var b = varX.divide(dir_var);

  var result = dir_mean.add(b.multiply(img.subtract(dir_mean)));
  return(result.arrayFlatten([['sum']]));
}


