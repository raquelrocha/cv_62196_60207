
var gl = null; // WebGL context
var shaderProgram = null;
var polygonVertexPositionBuffer = null;
var polygonVertexColorBuffer = null;
var height, width;
var style = 0;
var spacefillGranurarity = 0;

// The GLOBAL transformation parameters
var globalAngleXX = -25.0;
var globalAngleYY = 0.0;
var globalAngleZZ = 0.0;

var globalTx = 0.0;
var globalTy = -0.3;
var globalTz = 0.0;

// The local transformation parameters
// The translation vector
var tx = 0.0;
var ty = 0.0;
var tz = 0.0;
var txScale = 1.0;
var tyScale = 1.0;
var tzScale = 1.0;

// The scaling factors
var sx = 0.5;
var sy = 0.5;
var sz = 0.5;

// GLOBAL Animation controls
var globalRotationXX_ON = 0;
var globalRotationXX_DIR = 0;
var globalRotationXX_SPEED = 0;
var globalRotationYY_ON = 0;
var globalRotationYY_DIR = 1;
var globalRotationYY_SPEED = 1;
var globalRotationZZ_ON = 0;
var globalRotationZZ_DIR = 0;
var globalRotationZZ_SPEED = 0;

// To allow choosing the way of drawing the model triangles
var primitiveType = null;

// To allow choosing the projection type
var projectionType = 0;
//vec3(0.58,-0.6,0.05)

// para os mover de pino no eixo do x: somar ou subtrair 0.59 no indice 0 do vec3

// para os mover no eixo do yy do mesmo pino 
// - somar 0.1 no indice 1 e subtrair 0.01 no indice 2
// - subtrair 0.1 no indice 1 e somar 0.01 no indice 2

var defaultPoints = [
	vec3(0.015,0.0,0.0), vec3(0.605,0.0,0.0), vec3(-0.57,0.0,0.0), 
	//vec3(0.07,-0.6,0.05), vec3( 0.00,-0.5,0.04), vec3(-0.07,-0.4,0.03), vec3(-0.14,-0.3,0.02), vec3(-0.21,-0.2,0.01),
	//vec3(-0.28,-0.1,0.0), vec3(-0.35,0.0,-0.01), vec3(-0.42, 0.1,-0.02), vec3(-0.49, 0.2,-0.03)
    vec3(0.07,-0.6,0.05),
	vec3(0,-0.5,0.035),
	vec3(-0.07,-0.4,0.020000000000000004),
	vec3(-0.14,-0.30000000000000004,0.0050000000000000044),
	vec3(-0.21,-0.20000000000000004,-0.009999999999999995),
	vec3(-0.28,-0.10000000000000003,-0.024999999999999994),
	vec3(-0.35,-2.7755575615628914e-17,-0.039999999999999994),
	vec3(-0.42,0.09999999999999998,-0.05499999999999999),
	vec3(-0.492,0.19999999999999998,-0.06999999999999999)
];

var points = defaultPoints.slice(0);
var hanoiDiscsZero = {
	1 : [
			vec3(0.07,-0.6,0.05),
			vec3(0.66,-0.6,0.05),
			vec3(1.25,-0.6,0.05)  
		],
	2 : [
			vec3(0.00,-0.6,0.05),	
			vec3(0.59,-0.6,0.05),
			vec3(1.18,-0.6,0.05)
		],
	3 : [
			vec3(-0.07,-0.6,0.05),	
			vec3(0.52,-0.6,0.05),
			vec3(1.11,-0.6,0.05)
		],
	4 : [
			vec3(-0.14,-0.6,0.05),	
			vec3(0.45,-0.6,0.05),
			vec3(1.04,-0.6,0.05)
		],
	5 : [
			vec3(-0.21,-0.6,0.05),	
			vec3(0.38,-0.6,0.05),
			vec3(0.97,-0.6,0.05)
		],
	6 : [
			vec3(-0.28,-0.6,0.05),	
			vec3(0.31,-0.6,0.05),
			vec3(0.9,-0.6,0.05)
		],
	7 : [
			vec3(-0.35,-0.6,0.05),	
			vec3(0.24,-0.6,0.05),
			vec3(0.83,-0.6,0.05)
		],
	8 : [
			vec3(-0.42,-0.6,0.05),	
			vec3(0.17,-0.6,0.05),
			vec3(0.76,-0.6,0.05)
		],
	9 : [
			vec3(-0.492,-0.6,0.05),
			vec3(0.09,-0.6,0.05),
			vec3(0.68,-0.6,0.05)
		]
};

function moveUp(point){
	point[1] += 0.1;
	point[2] -= 0.015;
	return point;
}

var argolas = 3;
var hanoi = [argolas,0,0];

function moveDisc(disc, orig, dest){
	hanoi[orig]--;

	points[2+disc] = hanoiDiscsZero[disc][dest].slice(0);
	for(var q = 0; q<hanoi[dest]; q++)
		points[2+disc] = moveUp(points[2+disc]);

	hanoi[dest]++;
}

//----------------------------------------------------------------------------
//
// The WebGL code
//

//----------------------------------------------------------------------------
//
//  Rendering
//

// Handling the Vertex and the Color Buffers

function initBuffers(i) {
		// Coordinates
	polygonVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, polygonVertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(polyVertices[i]), gl.STATIC_DRAW);
	polygonVertexPositionBuffer.itemSize = 3;
	polygonVertexPositionBuffer.numItems = polyVertices[i].length / 3;

	// Associating to the vertex shader
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
			polygonVertexPositionBuffer.itemSize,
			gl.FLOAT, false, 0, 0);
}

function initColorBuffer(i){
	polygonVertexColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, polygonVertexColorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors[i]), gl.STATIC_DRAW);
	polygonVertexColorBuffer.itemSize = 3;
	polygonVertexColorBuffer.numItems = polyVertices[i].length / 3;

	// Associating to the vertex shader
	gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, 
			polygonVertexColorBuffer.itemSize, 
			gl.FLOAT, false, 0, 0);
}

function drawModel(	sx, sy, sz,
					tx, ty, tz,
					mvMatrix,
					primitiveType, rotation ) {
    // Pay attention to transformation order !!
	mvMatrix = mult( mvMatrix, translationMatrix( tx, ty, tz ) );
	if(rotation!==null){
		mvMatrix = mult( mvMatrix, rotationZZMatrix( rotation[2] ) );
		mvMatrix = mult( mvMatrix, rotationYYMatrix( rotation[1] ) );
		mvMatrix = mult( mvMatrix, rotationXXMatrix( rotation[0] ) );
	}
	mvMatrix = mult( mvMatrix, scalingMatrix( sx, sy, sz ) );

	// Passing the Model View Matrix to apply the current transformation
	var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	gl.uniformMatrix4fv(mvUniform, false, new Float32Array(flatten(mvMatrix)));

    // Passing the buffers
	gl.drawArrays(primitiveType, 0, polygonVertexPositionBuffer.numItems); 
}

//----------------------------------------------------------------------------
//  Drawing the 3D scene
function drawScene() {
	var pMatrix;
	var mvMatrix = mat4();

	// Clearing the frame-buffer and the depth-buffer
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// Computing the Projection Matrix
	if( projectionType == 0 ) {
		// For now, the default orthogonal view volume
		pMatrix = ortho( -1.0, 1.0, -1.0, 1.0, -1.0, 1.0 );
		// Global transformation !!
		globalTz = 0.0;
	}
	else {
		// A standard view volume.
		// Viewer is at (0,0,0)
		// Ensure that the model is "inside" the view volume
		pMatrix = perspective( 45, 1, 0.05, 15 );

		// Global transformation !!
		globalTz = -2.5;
	}

	// Passing the Projection Matrix to apply the current projection

	var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	gl.uniformMatrix4fv(pUniform, false, new Float32Array(flatten(pMatrix)));

		// GLOBAL TRANSFORMATION FOR THE WHOLE SCENE
	mvMatrix = mult( translationMatrix( globalTx, globalTy, globalTz ), rotationZZMatrix( globalAngleZZ ) );
	mvMatrix = mult( mvMatrix, rotationYYMatrix( globalAngleYY ) );	
	mvMatrix = mult( mvMatrix, rotationXXMatrix( globalAngleXX + 80 ) );

	var globalScale = [1, 1];


	/* DRAW BASE START */
	computeIllumination(mvMatrix, 0 , 3, polyVertices[0], polyNormals[0]);
	initColorBuffer(0);
	initBuffers(0);
	drawModel( sx*globalScale[0], 
		sy*globalScale[0], 
		sz*globalScale[0],
       tx+points[0][0]*txScale, ty+points[0][1]*tyScale, tz+points[0][2]*tzScale,
       mvMatrix,
       primitiveType, null);
	drawModel( sx*globalScale[0], 
		sy*globalScale[0], 
		sz*globalScale[0],
       tx+points[1][0]*txScale, ty+points[1][1]*tyScale, tz+points[1][2]*tzScale,
       mvMatrix,
       primitiveType, null);
	drawModel( sx*globalScale[0], 
		sy*globalScale[0], 
		sz*globalScale[0],
       tx+points[2][0]*txScale, ty+points[2][1]*tyScale, tz+points[2][2]*tzScale,
       mvMatrix,
       primitiveType, null);
	/* DRAW BASE END */
	

    /* DRAW DISKS*/
	mvMatrix = mult( translationMatrix( globalTx, globalTy, globalTz ), rotationZZMatrix( globalAngleZZ ) );
	mvMatrix = mult( mvMatrix, rotationYYMatrix( globalAngleYY ) );	
	mvMatrix = mult( mvMatrix, rotationXXMatrix( globalAngleXX ) );

	var internalSize = 1.35;
	for(var k = 0; k< argolas; k++){
		computeIllumination(mvMatrix, 1 , k % nPhong.length, polyVertices[1], polyNormals[1]);
		initColorBuffer( 1 );
		initBuffers( 1 );
		drawModel( sx*globalScale[1]*internalSize, 
				sy*globalScale[1], 
				sz*globalScale[1],
	           tx+points[k+3][0]*txScale, ty+points[k+3][1]*tyScale, tz+points[k+3][2]*tzScale,
	           mvMatrix,
	           primitiveType, null);
		internalSize -= 0.15;
	}

			
}

//----------------------------------------------------------------------------
//
//  NEW --- Animation
//
// Animation --- Updating transformation parameters
var lastTime = 0;

function animate() {
	var timeNow = new Date().getTime();
	if( lastTime != 0 ) {
		var elapsed = timeNow - lastTime;

		// Global rotation
		if( globalRotationXX_ON ) {
			globalAngleXX += globalRotationXX_DIR * globalRotationXX_SPEED * (90 * elapsed) / 1000.0;
	    }

		if( globalRotationYY_ON ) {
			globalAngleYY += globalRotationYY_DIR * globalRotationYY_SPEED * (90 * elapsed) / 1000.0;
	    }

		if( globalRotationZZ_ON ) {
			globalAngleZZ += globalRotationZZ_DIR * globalRotationZZ_SPEED * (90 * elapsed) / 1000.0;
	    }
	}
	lastTime = timeNow;
}


//----------------------------------------------------------------------------
// Timer
function tick() {
	requestAnimFrame(tick);
	drawScene();
	animate();
}

//----------------------------------------------------------------------------
//
// WebGL Initialization
//
function initWebGL( canvas ) {
	try {
		// Create the WebGL context
		// Some browsers still need "experimental-webgl"
		gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

		// DEFAULT: The viewport occupies the whole canvas
		// DEFAULT: The viewport background color is WHITE
		// NEW - Drawing the triangles defining the model
		primitiveType = gl.TRIANGLES;
		// DEFAULT: Face culling is DISABLED
		// Enable FACE CULLING
		gl.enable( gl.CULL_FACE );
		// DEFAULT: The BACK FACE is culled!!
		// The next instruction is not needed...
		gl.cullFace( gl.BACK );
		// Enable DEPTH-TEST
		gl.enable( gl.DEPTH_TEST );
        height = canvas.height;
        width = canvas.width;
	} catch (e) {}
	if (!gl) {
		alert("Could not initialise WebGL, sorry! :-(");
	}
}

//----------------------------------------------------------------------------

function runWebGL() {
	var canvas = document.getElementById("my-canvas");
	initWebGL( canvas );
	shaderProgram = initShaders( gl );
    setEventListeners();
    argolas = numDiscos;
    hanoi = [argolas,0,0];
    points = defaultPoints.slice(0);
    canvas.onmousedown = handleMouseDown;
	tick();
}



var hanoiAutoMoves = [];

function recursivePrint(hanoiMoves){
	if(hanoiMoves.length==0){
        setTimeout(function() {
            warning(3);
        }, 300);
        return;
	}
	else{
            setTimeout(function () {
                idxMove++;
                var thisMove = hanoiAutoMoves.pop();
                moveDisk(thisMove[0], thisMove[1]);
                document.getElementById("movesN").innerText = idxMove;
                doTable(document.getElementById("tableMoves"));
                recursivePrint(hanoiMoves);
            }, 300);
        }
}

function setEventListeners() {
    document.getElementById("undo-button").onclick = function(){
        undo();
    };

    document.getElementById("solve-button").onclick = function(){
        startClean();
        hanoiAutoMoves = [];
        hanoiAlgorithm(10 - numDiscos,0,1,2);

        recursivePrint(hanoiAutoMoves.reverse());
    };

    document.getElementById("diskN").onclick = function(){
        numDiscos = parseInt(document.getElementById("numdiscos").value);
        argolas = numDiscos;
        hanoi = [argolas,0,0];
        points = defaultPoints.slice(0);
        startClean();
        document.getElementById("numdiscos").value = "";
    };


    document.getElementById("redo-button").onclick = function(){
        redo();
    };
    document.getElementById("reset-button").onclick = function () {

    	startClean();
        // Render the viewport
        drawScene();
    };
}

function startClean(){
    move = [];
    pins = {};
    pins[0] = [];
    for(var i = 1; i <= numDiscos; i++){
        pins[0].push(i);
    }
    pins[1] = [];
    pins[2] = [];
    idxMove = 0;

    document.getElementById("movesN").innerText = 0;
    document.getElementById("tableMoves").innerHTML="<tr><th>#</th><th>Disco</th><th>Origem</th><th>Destino</th></tr>";
    document.getElementById("erroDiv").style.visibility = "hidden";
    document.getElementById("my-canvas").style.cursor = "default";

    document.getElementById("redo-button").disabled = "disabled";
    document.getElementById("undo-button").disabled = "disabled";

    argolas = numDiscos;
    hanoi = [argolas,0,0];
    points = defaultPoints.slice(0);
}


var mouseDown = false;
var firstMouse = 0;
var secondMouse = 0;
var pins = {};
pins[0] = [1, 2, 3];
pins[1] = [];
pins[2] = [];
var move = [];
var idxMove = 0;
var numDiscos = 3;

function handleMouseDown(event) {
    var canvasStartOffset = (window.innerWidth - document.getElementById("my-canvas").offsetWidth) / 2;
    var normalized = (event.clientX - canvasStartOffset) / document.getElementById("my-canvas").offsetWidth;
    var finalValue = normalized * 4 - 2;
    var result;

    if (mouseDown) {
        secondMouse = finalValue;
        mouseDown = false;
        result = isClickValid(finalValue, 0);
    }
    else {
        firstMouse = finalValue;
        mouseDown = true;
        result = isClickValid(finalValue, 1);
    }

    warning(result);
}

function warning(type) {
	/*
	 0 -> No disk
	 -1 -> Pino de destino = pino de origem
	 -2 -> Pino de destino contém discos maiores q aquele a mover
	 1 ->Acabou
	 */
    if(type == 3){
        alert("O algoritmo acabou com " + idxMove + " movimentos. Clique OK para começar um novo jogo.");
        startClean();
    }
    else if(type == 2){
        alert("Parabéns! Acabou com " + idxMove + " movimentos. Clique OK para começar um novo jogo.");
        startClean();
    }
    else if (type < 1) {
        document.getElementById("erroDiv").style.visibility = "visible";
        var erro = document.getElementById("erro");
        document.getElementById("my-canvas").style.cursor = "default";
        switch (type) {
            case 0:
                erro.innerText = "Não existem discos no pino selecionado!!";
                diskToMove = 0;
                firstMouse = 0;
                secondMouse = 0;

                mouseDown(false);
                break;
            case -1:
                erro.innerText = "O pino de destino não pode ser o mesmo de origem!!";
                break;
            case -2:
                erro.innerText = "Só pode colocar o disco por cima de outro disco de maior tamanho!!";
                break;
        }
    }
    else
        document.getElementById("erroDiv").style.visibility = "hidden";
}

var diskToMove;
var pinOrigem, pinDestino;

function isClickValid(value, type) {
	/*
	 Valores de retorno:
	 1 -> Valido
	 0 -> No disk
	 -1 -> Pino de destino = pino de origem
	 -2 -> Pino de destino contém discos maiores q aquele a mover
	 */
	/*
	 * Verifica se o clique é válido consoante:
	 * Se for o primeiro clique:
	 * O pino tem que ter discos
	 * Se for o segundo clique:
	 * O pino tem que ou estar vazio ou ter discos maiores
	 * Não pode ser o pino de origem
	 */

    var aux = inRange(value) - 1;
    if (type) //type=1 -> first click
    {
        if (pins[aux].length != 0) {
            pinOrigem = aux;
            document.getElementById("my-canvas").style.cursor = "crosshair";
            return 1;
        }
        else
            return 0;
    }
    else { //type = 0 -> second click
        if (pinOrigem == aux)
            return -1;
        else if (pins[aux][pins[aux].length - 1] > pins[pinOrigem][pins[pinOrigem].length - 1])
            return -2;
        else {
            pinDestino = aux;
            idxMove++;
            undoMoves = [];
            document.getElementById("redo-button").disabled = "disabled";
            moveDisk(pinOrigem,pinDestino);
            doTable(document.getElementById("tableMoves"));
            pinOrigem = -1;
            if(pins[pinDestino].length == numDiscos) {
                setTimeout(function(){
                    warning(2);
				},300);
            }
            return 1;
        }

    }
}

function moveDisk(origem, destino){

	diskToMove = pins[origem].pop();
    pins[destino].push(diskToMove);
    moveDisc(diskToMove, origem, destino);
    move.push({"idx": idxMove,"disc": diskToMove, "origem": origem+1, "destino": destino+1});

    document.getElementById("movesN").innerText = idxMove;
    document.getElementById("undo-button").disabled = "";
}

var undoMoves = [];
function undo(){
	console.log(hanoi);
    if(move.length>0) {
        undoMoves.push(move[move.length-1]);
        moveDisk(move[move.length - 1]["destino"] - 1, move[move.length - 1]["origem"] - 1);
        move.pop();
        move.pop();
        idxMove--;

        document.getElementById("movesN").innerText = idxMove;
        doTable(document.getElementById("tableMoves"));
        document.getElementById("redo-button").disabled = "";
    }
    if(move.length == 0)
        document.getElementById("undo-button").disabled = "disabled";
}

function redo(){
    var aux = undoMoves.pop();
    idxMove++;
    moveDisk(aux["origem"] - 1, aux["destino"] - 1);

    document.getElementById("movesN").innerText = idxMove;
    doTable(document.getElementById("tableMoves"));
    if(undoMoves.length == 0)
        document.getElementById("redo-button").disabled = "disabled";
}


function hanoiAlgorithm(disk, source, dest, spare)
{
    if (disk==9)
        hanoiAutoMoves.push([source, dest]);
	else{
        hanoiAlgorithm(disk + 1, source, spare, dest);
        hanoiAutoMoves.push([source, dest]);
        hanoiAlgorithm(disk + 1, spare, dest, source);
    }
}

function inRange(value) {
	/*
	 Verifica a que região pertence o valor introduzido,
	 Devolve o pino respectivo.
	 TODO: Verificar os valores
	 */
    if (value < -0.5)
        return 1;
    if (value > 0.50)
        return 3;
    else
        return 2;
}


function doTable(tbody){
    tbody.innerHTML = "<tr><th>#</th><th>Disco</th><th>Origem</th><th>Destino</th></tr>";
    for (var i = 0; i < move.length; i++) {
        var tr = "<tr>";
		/* Must not forget the $ sign */
        tr += "<td>" + move[i]["idx"] + "</td>" + "<td>" + move[i]["disc"] + "</td><td>" + move[i]["origem"] + "</td><td>"+ move[i]["destino"]+"</td></tr>";

		/* We add the table row to the table body */
        tbody.innerHTML += tr;
    }
}