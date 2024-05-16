/*jshint esversion: 6 */
// @ts-check

// these two things are the main UI code for the train
// students learned about them in last week's workbook

import { draggablePoints } from "../libs/CS559/dragPoints.js";
import { RunCanvas } from "../libs/CS559/runCanvas.js";

// this is a utility that adds a checkbox to the page 
// useful for turning features on and off
import { LabelSlider, makeCheckbox } from "../libs/CS559/inputHelpers.js";

/**
 * Have the array of control points for the track be a
 * "global" (to the module) variable
 *
 * Note: the control points are stored as Arrays of 2 numbers, rather than
 * as "objects" with an x,y. Because we require a Cardinal Spline (interpolating)
 * the track is defined by a list of points.
 *
 * things are set up with an initial track
 */
/** @type Array<number[]> */

let thePoints = [
  [125, 150],
  [200, 350],
  [100, 540],
  [450, 450],
  [470, 100],
];


/**
 * Draw function - this is the meat of the operation
 *
 * It's the main thing that needs to be changed
 *
 * @param {HTMLCanvasElement} canvas
 * @param {number} param
 */
function draw(canvas, param) {
  let doSimpleTrack = document.getElementById("check-simple-track").checked;
  let doDrawPoints = document.getElementById("check-drawPoints").checked;
  let doArcLength = document.getElementById("check-arc-length").checked;
  let numCars = document.getElementById("NumCars-slider").value;
  let doTruckedWheels = document.getElementById("check-truckedWheels").checked;

  let context = canvas.getContext("2d");
  // clear the screen
  context.clearRect(0, 0, canvas.width, canvas.height);


  // draw the control points
  if (doDrawPoints) {
    thePoints.forEach(function(pt) {
      context.beginPath();
      context.arc(pt[0], pt[1], 5, 0, Math.PI * 2);
      context.closePath();
      context.fill();
    });
  }
  
  // This function performs linear interpolation between two points p0 and p1 along a parameter t
  function linearInterpolate(p0, p1, t) {
    return p0.u + (p1.u - p0.u) * (t - p0.a) / (p1.a - p0.a);
  }
  

  // this function finds a point on a bezier curve
  // Uses formula for position along a bezier curve at a given paramter t
  function findPoints(t) {
    // Calculate the fractional part of t (how far along we are on the current segment of the curve)
    let frac = t % 1;
    // Current index of the point (what segment of the curve we started on)
    let currentIndex = Math.floor(t);

    let n = thePoints.length;
    let prevIndex = (currentIndex - 1 + n) % n;
    let nextIndex = (currentIndex + 1) % n;
    let nextNextIndex = (currentIndex + 2) % n;

    let curr = thePoints[currentIndex];
    let prev = thePoints[prevIndex];
    let next = thePoints[nextIndex];
    let nextNext = thePoints[nextNextIndex];

    let cp1x = curr[0] + (next[0] - prev[0]) / 6;
    let cp1y = curr[1] + (next[1] - prev[1]) / 6;
    let cp2x = next[0] - (nextNext[0] - curr[0]) / 6;
    let cp2y = next[1] - (nextNext[1] - curr[1]) / 6;

    // Calculate x and y coordinates using the Bezier curve formula
    let x =
      (1 - frac) * (1 - frac) * (1 - frac) * curr[0] +
      3 * (1 - frac) * (1 - frac) * frac * cp1x +
      3 * (1 - frac) * frac * frac * cp2x +
      frac * frac * frac * next[0];
    let y =
      (1 - frac) * (1 - frac) * (1 - frac) * curr[1] +
      3 * (1 - frac) * (1 - frac) * frac * cp1y +
      3 * (1 - frac) * frac * frac * cp2y +
      frac * frac * frac * next[1];

    return [x, y];

  }
  
  // this function finds direction/derivatives on a bezier curve
  // Uses the derivative of the formula for position along a bezier curve at a given paramter t
  function findDirection(t) {
    // Calculate the fractional part of t
    let frac = t % 1;

    // Current index of the point (aka what segment of the curve we started on)
    let currentIndex = Math.floor(t);

    let n = thePoints.length;
    let prevIndex = (currentIndex - 1 + n) % n;
    let nextIndex = (currentIndex + 1) % n;
    let nextNextIndex = (currentIndex + 2) % n;

    let curr = thePoints[currentIndex];
    let prev = thePoints[prevIndex];
    let next = thePoints[nextIndex];
    let nextNext = thePoints[nextNextIndex];

    let cp1x = curr[0] + (next[0] - prev[0]) / 6;
    let cp1y = curr[1] + (next[1] - prev[1]) / 6;
    let cp2x = next[0] - (nextNext[0] - curr[0]) / 6;
    let cp2y = next[1] - (nextNext[1] - curr[1]) / 6;

    // Calculate derivatives for the Bezier curve
    let dx =
      3 * (1 - frac) * (1 - frac) * (cp1x - curr[0]) +
      6 * (1 - frac) * frac * (cp2x - cp1x) +
      3 * frac * frac * (next[0] - cp2x);
    let dy =
      3 * (1 - frac) * (1 - frac) * (cp1y - curr[1]) +
      6 * (1 - frac) * frac * (cp2y - cp1y) +
      3 * frac * frac * (next[1] - cp2y);

    return [dx, dy];

  }

  function addSmoke(context, t) {
    context.save();
    context.fillStyle = "rgba(211, 211, 211, 0.5)"; 
    
    // Define the number of circles and their properties
    const numCircles = 40;
    const maxRadius = 10;
    const minRadius = 5;
    const maxOffset = 20;
    
    // Slightly randomize the position of the smoke
    // Randomize size of clouds
    for (let i = 0; i < numCircles; i++) {
     
      const radius = Math.random() * (maxRadius - minRadius) + minRadius;
        const offsetX = (Math.random() - 0.5) * maxOffset;
        const offsetY = (Math.random() - 0.5) * maxOffset;
        
        // Calculate the position of the circle based on the train's position
        const x = -i + offsetX;
        const y = -i + offsetY;

      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }
    context.restore();
}

  /*
  Helper function. Finds point along the main Bezier curve at a each point
  Uses offset to draw the rails (two parallel lines) of the track
  */
  function drawComplexTrackHelper(context, offset) {
    context.save();
      context.beginPath();
      let curr = 0;
      let next = 0;
      let point = findPoints(0);
      let derivs = findDirection(0);
      point.push(derivs[0], derivs[1], 0);

      let d = Math.sqrt(point[2] * point[2] + point[3] * point[3]);
      let dx0 = offset * point[2] / d;
      let dy0 = offset * point[3] / d; 
      context.moveTo(point[0] + dx0, point[1] - dy0);
      
      for (let pa = 0; pa <= table[4]; pa += 5) {
        for (next = curr; track[next].a < pa; next++){
          if (next > 0) {
            curr = next - 1;
            let u = linearInterpolate(track[curr], track[next], pa);
            point = findPoints(u);
            derivs = findDirection(u);
            point.push(derivs[0], derivs[1], u);
          }
          let magnitude = Math.sqrt(point[2] * point[2] + point[3] * point[3]);

          // Normalize the vector
          let normalizedX = point[2] / magnitude;
          let normalizedY = point[3] / magnitude;
          
          // Scale the normalized vector by the offset
          let dx1 = offset * normalizedX;
          let dy1 = offset * normalizedY;
          context.lineTo(point[0] + dy1, point[1] - dx1);
          context.stroke();
        }
      }
      context.closePath();
      context.restore();
    }
   
  // This function draws a realistic track
  // Uses derivative of position formula to find direction of track
  function drawComplexTrack(context) {
    context.save();
      context.strokeStyle = "grey";  
      context.lineWidth = 2;
      drawComplexTrackHelper(context, -15);
      drawComplexTrackHelper(context, 15);
    context.restore();

    // Draw Rails using arc length table    
    let w = 40
    let l = 10;
    
    let curr = 0;
    let next = 0;
    let point = findPoints(0);
    let derivs = findDirection(0);
    for (let i = 0; i <= table[4]; i += 30) {
      for (next = curr; track[next].a < i; next++);
      if (next > 0) {
        curr = next - 1;
        let u = linearInterpolate(track[curr], track[next], i);
        point = findPoints(u);
        derivs = findDirection(u);
      }

      context.save();
        context.lineWidth = 2;
        context.fillStyle = "#A1662F";
        context.strokeStyle = "black";
        context.translate(point[0], point[1]);
        let angle = Math.atan2(derivs[1], derivs[0]);
        context.rotate(angle);
        context.fillRect(-l, -w / 2, l, w);
      context.restore();
      }
    context.restore();

}

  function drawSimpleTrack(context) {
    context.beginPath();
    context.moveTo(thePoints[0][0], thePoints[0][1]);
    for (let i = 0; i < thePoints.length; i++) {
  
      let curr = thePoints[i];
      let next = thePoints[(i + 1) % thePoints.length];
      let prev = thePoints[(i - 1 + thePoints.length) % thePoints.length];
      let next2 = thePoints[(i + 2) % thePoints.length];
  
      let cp1x = curr[0] + (next[0] - prev[0]) / 6;
      let cp1y = curr[1] + (next[1] - prev[1]) / 6;
      let cp2x = next[0] - (next2[0] - curr[0]) / 6;
      let cp2y = next[1] - (next2[1] - curr[1]) / 6;
  
      context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, next[0], next[1]);
      context.stroke();
    }
    context.closePath();
  }

  function drawTrain(context, param, numCars = 1) {
    let width = 40;
    let length = 50;
    let point, derivs, angle;
    if (doArcLength) {
      let arcParam = (param / thePoints.length) * table[4];
      let curr = 0;
      let next;
      for (next = 0; track[next].a <= arcParam; next++);
      curr = next - 1;

      let parameter = linearInterpolate(track[curr], track[next], arcParam);
      point = findPoints(parameter);
      derivs = findDirection(parameter);
      angle = Math.atan2(derivs[1], derivs[0]);
    }
    else {
      point = findPoints(param);
      derivs = findDirection(param);
      angle = Math.atan2(derivs[1], derivs[0]);
    }
    
    context.save();
    context.translate(point[0], point[1]);
    context.rotate(angle);

    // Draw body of front train
    context.beginPath();
    context.moveTo(0, 0);
    context.fillRect(-length /1.2, -width / 2, length/1.2, width);
    context.save();

    if (doTruckedWheels) {
      // Draw trucked wheels
      context.save();
        context.fillStyle = "#636363";
        context.translate(-length / 1.3, width / 2);
        context.fillRect(0, 0, length / 4, width / 8);
        context.translate(length / 2.5, 0);
        context.fillRect(0, 0, length / 4, width / 8);
        context.translate(length/25, -width*1.1);
        context.fillRect(0, 0, length / 4, width / 8);
        context.translate(-length / 2.5, 0);
        context.fillRect(0, 0, length / 4, width / 8);
      context.restore();  
    }
    // thinner body part of front train
    context.translate(0, -width / 4);
    context.fillRect(0, 0, length / 8, width/2);
  context.restore()
    // Draw pipe of front train
    context.save();
      context.translate(length/8, -width / 2.5);
      context.fillRect(0,0, length / 2, width / 1.2);
      context.restore();
      context.save();
      // Draw pipe in front of front train
        context.translate(length / 2.8, 0);
        context.fillStyle = "#636363";
        context.arc(0, 0, width / 4, 0, Math.PI * 2);
        context.fill();
        addSmoke(context, param);
      context.restore();
      context.save();
      // Red ring around pipe
        context.translate(length / 2.8, 0);
        context.strokeStyle = "red";
        context.lineWidth = 2;
        context.beginPath();
        context.arc(0, 0, width / 4, 0, Math.PI * 2);
        context.stroke();
      context.restore();
      context.restore();

    if (numCars > 1) {
      for(let i = 1; i < numCars; i++) {
        let point, derivs, angle;
        if (doArcLength) {
          let arcParam = (param / thePoints.length) * table[4] - i*65;
          if(arcParam < 0) {
            arcParam += table[4];
            if (arcParam == table[4]) {
              arcParam -= 0.01;
            }
          }
          let curr = 0;
          let next;
          for (next = 0; track[next].a < arcParam; next++);
          curr = next - 1;
          let parameter = linearInterpolate(track[curr], track[next], arcParam);
          point = findPoints(parameter);
          derivs = findDirection(parameter);
          angle = Math.atan2(derivs[1], derivs[0]);
        }
        else {
          let u = (param - i*0.23) % thePoints.length;
          if (u < 0) {
            u += thePoints.length;
            if (u == thePoints.length) {
              u -= 0.01;
            }
          }

          point = findPoints(u);
          derivs = findDirection(u);

          angle = Math.atan2(derivs[1], derivs[0]);
        }
        context.save();
        context.translate(point[0], point[1]);
        context.rotate(angle);

        // Coal cars
        if (i < 3) {
          context.save();
            // connecting part
            context.fillStyle = "#800000";
            context.translate(0, -width / 4);
            context.fillRect(0, 0, length / 2, width / 2);
            //context.globalCompositeOperation = "source-over";

          context.restore();
          // body of coal car
          context.save();
            context.fillStyle = "#636363";
            context.strokeStyle = "black";
            context.lineWidth = 4;
            context.fillRect(-length / 1.2, -width / 2, length, width);
            context.strokeRect(-length / 1.2, -width / 2, length, width);
          context.restore();

          if (doTruckedWheels) {
            // Draw trucked wheels
            context.save();
              context.fillStyle = "#636363";
              context.translate(-length / 1.5, width / 1.8);
              context.fillRect(0, 0, length / 4, width / 8);
              context.translate(length / 2.5, 0);
              context.fillRect(0, 0, length / 4, width / 8);
              context.translate(length/25, -width*1.2);
              context.fillRect(0, 0, length / 4, width / 8);
              context.translate(-length / 2.5, 0);
              context.fillRect(0, 0, length / 4, width / 8);
            context.restore();
          }
        
        // Add coal
        context.save();
          context.fillStyle = "black";
          context.translate(-length / 1.4, -width / 3);

          for (let x = 0.3; x < length-0.3; x += length / 4) {
            for (let y = 0.3; y < width + 0.3; y += width / 4) {
              context.beginPath();
              context.arc(x, y, width / 7.8, 0, Math.PI * 2);
              context.fill();
            }
          }
          context.restore();
        }
        else {
          // draw connecting piece
          context.save();
            context.fillStyle = "#800000";
            context.translate(0, -width / 4);
            context.fillRect(0, 0, length / 2, width / 2);
          context.restore();
          // Draw regular passenger train car
          context.save();
            context.fillStyle = "black";
            context.fillRect(-length / 1.2, -width / 2, length, width);
          context.restore();
          // Maroon outline
          context.save();
            context.strokeStyle = "#800000";
            context.lineWidth = 4;
            context.strokeRect(-length / 1.2, -width / 2, length, width);
          context.restore();

          if (doTruckedWheels) {
            // Draw trucked wheels
            context.save();
              context.fillStyle = "#636363";
              context.translate(-length / 1.5, width / 1.8);
              context.fillRect(0, 0, length / 4, width / 8);
              context.translate(length / 2.5, 0);
              context.fillRect(0, 0, length / 4, width / 8);
              context.translate(length/25, -width*1.2);
              context.fillRect(0, 0, length / 4, width / 8);
              context.translate(-length / 2.5, 0);
              context.fillRect(0, 0, length / 4, width / 8);
            context.restore();
          }

        }
        context.restore();
      } 
    }
  }


  /* 
  This arc length table was based on Mike Glecher's alTable
  It calculates where the current point is based on the total distance of the track
  the track array stores the parameter value and the distance traveled at the parameter
  the table array is used as storage for the previous point. However, it also stores
  the total distance of the track once the loop is finished iterating. That will
  be useful when determining the position of the train during arc-length parameterization.
  */
  let track = [];
  track.push({ "u": 0, "a": 0 });
  let table = findPoints(0);
  table.push(findDirection(0)[0], findDirection(0)[1], 0);
  for(let t = 0.1; t < thePoints.length; t += 0.1) {
    let next = findPoints(t);
    let nextDeriv = findDirection(t);
    next.push(nextDeriv[0], nextDeriv[1]);
    let dx = next[0] - table[0];
    let dy = next[1] - table[1];
    let distance = Math.sqrt(dx **2 + dy **2);
    next.push(distance + table[4]);
    track.push({u: t, a: next[4]});
    table = next;
  }

  if (doSimpleTrack) {
    drawSimpleTrack(context);

  } else {
    drawComplexTrack(context);
  }

  drawTrain(context, param, numCars);
}


/**
 * Initialization code - sets up the UI and start the train
 */
let canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("canvas1"));
let context = canvas.getContext("2d");

// we need the slider for the draw function, but we need the draw function
// to create the slider - so create a variable and we'll change it later
let slider; // = undefined;

// note: we wrap the draw call so we can pass the right arguments
function wrapDraw() {
    // do modular arithmetic since the end of the track should be the beginning
    draw(canvas, Number(slider.value) % thePoints.length);
}
// create a UI
let runcanvas = new RunCanvas(canvas, wrapDraw);
// now we can connect the draw function correctly
slider = runcanvas.range;

let numCarsSlider = new LabelSlider("NumCars", {width: 150, min: 1, max: 8, step: 1, initial: 1, where: canvas.parentElement});

// note: if you add these features, uncomment the lines for the checkboxes
// in your code, you can test if the checkbox is checked by something like:
// document.getElementById("check-simple-track").checked
// in your drawing code
// WARNING: makeCheckbox adds a "check-" to the id of the checkboxes
//
// lines to uncomment to make checkboxes
makeCheckbox("simple-track");
makeCheckbox("arc-length").checked=true;
makeCheckbox("drawPoints");
makeCheckbox("truckedWheels")
//makeCheckbox("bspline");


// helper function - set the slider to have max = # of control points
function setNumPoints() {
    runcanvas.setupSlider(0, thePoints.length, 0.05);
}

setNumPoints();
runcanvas.setValue(0);

// add the point dragging UI
draggablePoints(canvas, thePoints, wrapDraw, 10, setNumPoints);

