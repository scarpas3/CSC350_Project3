
var canvas;
var gl;
var NumVertices = 0;
var lightPosition;
var points = [];
var colors = [];
var normalsArray = []; //normals array for flat shading
var avgNormalsArray = [];//normals array for phong and gauroud
var totalNormals = [];//an array used for obtaining the averages during the phong and geroud calculations
var normalLoc;
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 0;
var y = 0;
var lightY = 0;
var thetaLoc;
var radius = 1.5;
var lightRadius = 1.5;
var lightTheta = 0.0;
var theta = 0.0;
var dr = 36.0 * Math.PI / 180.0;
var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);
var positionsArray = [];
var left = -3.0;
var right = 3.0;
var topY = 3.0;
var bottom = -3.0;
var near = -10;
var far = 10;
var aspect;
var program;
var O_Or_P = true;
var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var nMatrix, nMatrixLoc;
var fovy = 45.0;
var sType = 0.0;

lightPosition = vec4(lightPosition = vec4(lightRadius * Math.sin(lightTheta), lightY, lightRadius * Math.cos(lightTheta), 0.0));
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);// light source
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);//light is white
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0); 
var materialAmbient = vec4(0.0, 0.5, 0.0, 1.0);
var materialDiffuse = vec4(0.0, 0.5, 0.0, 1.0);//default color for object is medium green with medium green ambience
var materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);
var materialShininess = 15.0; //medium shininess coefficient

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) { alert("WebGL 2.0 isn't available"); }

    object();

    gl.viewport(0, 0, canvas.width, canvas.height);
    aspect = canvas.width / canvas.height;
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);//these are whats going to be sent over to shader
    var specularProduct = mult(lightSpecular, materialSpecular);
    if (sType == 0.0){
        nBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

        normalLoc = gl.getAttribLocation(program, "aNormal");
        gl.vertexAttribPointer(normalLoc, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(normalLoc); //senidng normals over
    }

    else{
        nBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(avgNormalsArray), gl.STATIC_DRAW);

        normalLoc = gl.getAttribLocation(program, "aNormal");
        gl.vertexAttribPointer(normalLoc, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(normalLoc); //senidng normals over
    }
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");
    nMatrixLoc = gl.getUniformLocation(program, "uNormalMatrix");

    //event listeners for buttons

    document.getElementById("Button1").onclick = function () {
        O_Or_P = false; //use perspective
        near = 0.3
    };

    document.getElementById("Button2").onclick = function () {
        O_Or_P = true; //use ortho
        near = -10
    };


    window.onkeydown = function (event) {
        var key = String.fromCharCode(event.keyCode);
        switch (key) {
            case '1':
                theta -= dr;
                eye = vec3(radius * Math.sin(theta), y, radius * Math.cos(theta));//make eye rotate left
                break;

            case '2':
                theta += dr;
                eye = vec3(radius * Math.sin(theta), y, radius * Math.cos(theta)); //make eye rotate right
                break;

            case '3':
                y = y + 0.25;
                eye = vec3(radius * Math.sin(theta), y, radius * Math.cos(theta)); //move eye up
                break;

            case '4':
                y = y - 0.25;
                eye = vec3(radius * Math.sin(theta), y, radius * Math.cos(theta)); //move eye down
                break;

            case '5':
                radius = radius - 0.25;
                if (radius <= 0.25) {
                    radius = 0.25;
                }
                eye = vec3(radius * Math.sin(theta), y, radius * Math.cos(theta)); //move eye forward
                break;

            case '6':
                radius = radius + 0.25;
                if (radius >= 2.50) {
                    radius = 2.50;
                }
                eye = vec3(radius * Math.sin(theta), y, radius * Math.cos(theta)); //move eye back
                break;

            case 'Q':
                lightTheta -= dr; //rotate light left
                lightPosition = vec4(lightRadius * Math.sin(lightTheta), lightY, lightRadius * Math.cos(lightTheta), 0.0);
                break;

            case 'W':
                lightTheta += dr; //rotate light right
                lightPosition = vec4(lightRadius * Math.sin(lightTheta), lightY, lightRadius * Math.cos(lightTheta), 0.0);
                break;

            case 'E':
                lightY = lightY + 0.25; //move light up
                lightPosition = vec4(lightRadius * Math.sin(lightTheta), lightY, lightRadius * Math.cos(lightTheta), 0.0);
                break;

            case 'R':
                lightY = lightY - 0.25; //move light down
                lightPosition = vec4(lightRadius * Math.sin(lightTheta), lightY, lightRadius * Math.cos(lightTheta), 0.0);
                break;

            case 'T':
                lightRadius = lightRadius - 0.25; //move light forward
                if (lightRadius <= 0.25) {
                    lightRadius = 0.25;
                }
                lightPosition = vec4(lightRadius * Math.sin(lightTheta), lightY, lightRadius * Math.cos(lightTheta), 0.0);
                break;

            case 'Y':
                lightRadius = lightRadius + 0.25;//move light back
                if (lightRadius >= 2.50) {
                    lightRadius = 2.50;
                }
                lightPosition = vec4(lightRadius * Math.sin(lightTheta), lightY, lightRadius * Math.cos(lightTheta), 0.0);
                break;
        }
        gl.uniform4fv(gl.getUniformLocation(program, "uLightPosition"), lightPosition);
        gl.uniform3fv(gl.getUniformLocation(program, "uEyePosition"), eye); //resending light and eye position to shader
    };
    
    document.getElementById("Controls").onclick = function( event) {
        switch(event.target.index) {
          case 0:
            sType = 0.0;
            nBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);
            normalLoc = gl.getAttribLocation(program, "aNormal");
            gl.vertexAttribPointer(normalLoc, 4, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(normalLoc); //senidng normals over
            break;

         case 1:
            sType = 1.0;
            nBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(avgNormalsArray), gl.STATIC_DRAW);
            normalLoc = gl.getAttribLocation(program, "aNormal");
            gl.vertexAttribPointer(normalLoc, 4, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(normalLoc); //senidng normals over
            break;

         case 2:
            sType = 2.0;
            nBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(avgNormalsArray), gl.STATIC_DRAW);
            normalLoc = gl.getAttribLocation(program, "aNormal");
            gl.vertexAttribPointer(normalLoc, 4, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(normalLoc); //senidng normals over
            break;
       }
    };
    document.getElementById("LightOptions").onclick = function (event) { //different options the user can choose
        switch (event.target.index) {//changes colors and material properties of object
            case 0: //red
                materialAmbient = vec4(0.75, 0.75, 0.75, 1.0);
                materialDiffuse = vec4(1.0, 0.0, 0.0, 1.0);//red
                materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);//white
                materialShininess = 10.0;
                break;

            case 1: //orange
                materialAmbient = vec4(0.1, 0.05, 0.0, 1.0);
                materialDiffuse = vec4(255.0 / 256.0, 100.0 / 256.0, 0.0, 1.0); //orange
                materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);//white
                materialShininess = 30.0;
                break;

            case 2: //purple
                materialAmbient = vec4(0.0, 0.0, 0.0, 1.0);
                materialDiffuse = vec4(1.0, 0.0, 1.0, 1.0);//purple
                materialSpecular = vec4(0.0, 0.0, 1.0, 1.0);//blue
                materialShininess = 20.0;
                break;
        }

        ambientProduct = mult(lightAmbient, materialAmbient);
        diffuseProduct = mult(lightDiffuse, materialDiffuse);
        specularProduct = mult(lightSpecular, materialSpecular);
        gl.uniform4fv(gl.getUniformLocation(program,
            "uAmbientProduct"), ambientProduct);
        gl.uniform4fv(gl.getUniformLocation(program,
            "uDiffuseProduct"), diffuseProduct);
        gl.uniform4fv(gl.getUniformLocation(program, //sending all products over as well as shininess again
            "uSpecularProduct"), specularProduct);
        gl.uniform1f(gl.getUniformLocation(program,
            "uShininess"), materialShininess);
    };

    gl.uniform4fv(gl.getUniformLocation(program,
        "uAmbientProduct"), ambientProduct);
    gl.uniform4fv(gl.getUniformLocation(program,
        "uDiffuseProduct"), diffuseProduct);
    gl.uniform4fv(gl.getUniformLocation(program,
        "uSpecularProduct"), specularProduct);//sending all products over as well as shininess
    gl.uniform4fv(gl.getUniformLocation(program,
        "uLightPosition"), lightPosition);
    gl.uniform1f(gl.getUniformLocation(program,
        "uShininess"), materialShininess);



    render();
}

function triangle(a, b, c) {

    var t1 = subtract(vertices[b - 1], vertices[a - 1]);
    var t2 = subtract(vertices[c - 1], vertices[a - 1]);//use these 3 for modified triangle function
    var normal = normalize(cross(t1, t2));

    normalsArray.push(vec4(normal[0], normal[1], normal[2], 0.0));
    normalsArray.push(vec4(normal[0], normal[1], normal[2], 0.0));
    normalsArray.push(vec4(normal[0], normal[1], normal[2], 0.0)); //calculates normals and points of triangles

    points.push(vertices[a - 1]);
    points.push(vertices[b - 1]);
    points.push(vertices[c - 1]);

    NumVertices += 3;
}

function triangle2(a, b, c) {

    var t1 = subtract(vertices[b - 1], vertices[a - 1]);
    var t2 = subtract(vertices[c - 1], vertices[a - 1]);//use these 3 for modified triangle function
    var normal = normalize(cross(t1, t2));
    return normal;
}

function divVector(a,b){
    var c0 = a[0] / b;
    var c1 = a[1] / b;
    var c2 = a[2] / b;
    var c = vec4(c0,c1,c2,0.0);
    return c;
}

var vertices = [];

var faces = [];

function object() { //this function is building whatever object
    var i = 0;
    var xc = (xmin + xmax) / 2;
    var yc = (ymin + ymax) / 2;
    var zc = (zmin + zmax) / 2;
    scalex = xmax - xmin;
    scaley = ymax - ymin;
    scalez = zmax - zmin;
    scale = Math.max(scalex, scaley, scalez);
    while (obj[i] == 'v') {
        vertices.push(vec3((obj[i + 1] - xc) / scale, (obj[i + 2] - yc) / scale, (obj[i + 3] - zc) / scale));
        i += 4;
    }
    while (obj[i] == 'f') {
        faces.push(vec3(obj[i + 1], obj[i + 2], obj[i + 3]));
        i += 4;
    }

    for(var i = 0; i < vertices.length; i++){
        avgNormalsArray[i] = vec3(0,0,0);
        totalNormals[i] = 0.0;
    }

    //something must be implemented here to keep track of vertices
    //loop over faces
    for(var i = 0; i < faces.length; i++){
        var a = faces[i][0];
        var b = faces[i][1];
        var c = faces[i][2];
        faceNormal = triangle2(a,b,c);
        avgNormalsArray[a-1] = add(avgNormalsArray[a-1],faceNormal);
        totalNormals[a-1] += 1.0;
        avgNormalsArray[b-1] = add(avgNormalsArray[b-1],faceNormal);
        totalNormals[b-1] += 1.0;
        avgNormalsArray[c-1] = add(avgNormalsArray[c-1],faceNormal);
        totalNormals[c-1] += 1.0; 
    }
    for (var i = 0; i < avgNormalsArray.length; ++i){
        var temp = divVector(avgNormalsArray[i],totalNormals[i]);
        avgNormalsArray[i] = temp;
    }
    for (var i = 0; i < faces.length; i++) {
        triangle(faces[i][0], faces[i][1], faces[i][2]);
    }
}

//use code on canvas for perspective projection
//html file will be EXTREMELY similar to shadedsphere.html by the end.
//normals for flat shading: a vector thats perpendicular to the triangle normalize(cross(b-a,c-a)); where triangle is left to right b.a.c
//normals for other two shading types: for each vertex, we need to find each face that vertex belongs to, compute the normal of each face that vertex belongs to, then average them
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye = vec3(radius * Math.sin(theta), y, radius * Math.cos(theta));
    gl.uniform3fv(gl.getUniformLocation(program,
        "uEyePosition"), eye); //sending eye position over with render
    modelViewMatrix = lookAt(eye, at, up); 
    nMatrix = normalMatrix(modelViewMatrix, true); 
    if (O_Or_P == true) {
        projectionMatrix = ortho(left, right, bottom, topY, near, far);
    }
    else {
        projectionMatrix = perspective(fovy, aspect, near, far);
    }//depending on if Ortho or perspective, adjust projectionMatrix accrodingly
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    gl.uniform1f( gl.getUniformLocation(program,
        "usType"),sType );
    
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);

    requestAnimationFrame(render);
}
