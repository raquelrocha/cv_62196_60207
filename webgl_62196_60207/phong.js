
// Kamb coef.
var kAmbi = [
	[0.3,0,0],//Plástico Vermelho
	[0.25,0.2,0.07],//Ouro
	[0,0,0.5],//Azul Muito Brilhante
	[0.2,0.2,0.2],//Cinzento
	[0.25,0.15,0.06]//Bronze Polido
];
 
// Difuse coef.
var kDiff = [
	[0.6,0,0],//Plástico Vermelho
	[0.75,0.6,0.23],//Ouro
	[0,0,1],//Azul Muito Brilhante
	[0.7, 0.7, 0.7],//Cinzento
	[0.4,0.24,0.1]//Bronze Polido
];
 
// Specular coef.
var kSpec = [
	[0.8,0.6,0.6],//Plástico Vermelho
	[0.63,0.56,0.37],//Ouro
	[1,1,1],//Azul Muito Brilhante
	[0.7, 0.7, 0.7],//Cinzento
	[0.77,0.46,0.2]//Bronze Polido
];
 
// Phong coef.
var nPhong = [
	32,//Plástico Vermelho
	51.2,//Ouro
	125,//Azul Muito Brilhante
	100,//Cinzento
	76.8//Bronze Polido
];
 
/*
	0 - Plástico Vermelho
	1 - Ouro
	2 - Azul Muito Brilhante
	3 - Cinzento
	4 - Bronze Polido
*/

//----------------------------------------------------------------------------
//  Computing the illumination and rendering the model
function computeIllumination( mvMatrix, polyIdx, colorIdx, vertexes, vNormals ) {
	// Phong Illumination Model
	// Clearing the colors array
	for( var i = 0; i < colors[polyIdx].length; i++ ){
		colors[polyIdx][i] = 0.0;
	}

    // SMOOTH-SHADING
    // Compute the illumination for every vertex
    // Iterate through the vertices
    for( var vertIndex = 0; vertIndex < vertexes.length; vertIndex += 3 ){
		// For every vertex
		// GET COORDINATES AND NORMAL VECTOR
		var auxP = vertexes.slice( vertIndex, vertIndex + 3 );
		var auxN = vNormals.slice( vertIndex, vertIndex + 3 );

        // CONVERT TO HOMOGENEOUS COORDINATES
		auxP.push( 1.0 );
		auxN.push( 0.0 );

        // APPLY CURRENT TRANSFORMATION
        var pointP = multiplyPointByMatrix( mvMatrix, auxP );
        var vectorN = multiplyVectorByMatrix( mvMatrix, auxN );

        normalize( vectorN );

		// VIEWER POSITION
		var vectorV = vec3();
		if( projectionType == 0 ) {
			// Orthogonal
			vectorV[2] = 1.0;
		} else {
		    // Perspective
		    // Viewer at ( 0, 0 , 0 )
			vectorV = symmetric( pointP );
		}

        normalize( vectorV );
	    // Compute the 3 components: AMBIENT, DIFFUSE and SPECULAR
	    // FOR EACH LIGHT SOURCE
	    for(var l = 0; l < lightSources.length; l++ )
	    {
			if( lightSources[l].isOff() ) {
				continue;
			}

	        // INITIALIZE EACH COMPONENT, with the constant terms
		    var ambientTerm = vec3();
		    var diffuseTerm = vec3();
		    var specularTerm = vec3();

		    // For the current light source
		    var ambient_Illumination = lightSources[l].getAmbIntensity();
		    var int_Light_Source = lightSources[l].getIntensity();
		    var pos_Light_Source = lightSources[l].getPosition();

		    // Animating the light source, if defined
		    var lightSourceMatrix = mat4();

		    // COMPLETE THE CODE FOR THE OTHER ROTATION AXES
		    if( lightSources[l].isRotYYOn() ) {
				lightSourceMatrix = mult( lightSourceMatrix, rotationYYMatrix( lightSources[l].getRotAngleYY() ) );
			}

	        for( var i = 0; i < 3; i++ ) {
			    // AMBIENT ILLUMINATION --- Constant for every vertex
			    ambientTerm[i] = ambient_Illumination[i] * kAmbi[colorIdx][i];
	            diffuseTerm[i] = int_Light_Source[i] * kDiff[colorIdx][i];
	            specularTerm[i] = int_Light_Source[i] * kSpec[colorIdx][i];
	        }

	        // DIFFUSE ILLUMINATION
	        var vectorL = vec4();

	        if( pos_Light_Source[3] == 0.0 ) {
	            // DIRECTIONAL Light Source
	            vectorL = multiplyVectorByMatrix( lightSourceMatrix, pos_Light_Source );
	        } else {
	            // POINT Light Source
	            // TO DO : apply the global transformation to the light source?
	            vectorL = multiplyPointByMatrix( lightSourceMatrix, pos_Light_Source );

				for( var i = 0; i < 3; i++ ) {
	                vectorL[ i ] -= pointP[ i ];
	            }
	        }

			// Back to Euclidean coordinates
			vectorL = vectorL.slice(0,3);

	        normalize( vectorL );

	        var cosNL = dotProduct( vectorN, vectorL );

	        if( cosNL < 0.0 ) {
				// No direct illumination !!
				cosNL = 0.0;
	        }

	        // SEPCULAR ILLUMINATION
	        var vectorH = add( vectorL, vectorV );

	        normalize( vectorH );

	        var cosNH = dotProduct( vectorN, vectorH );

			// No direct illumination or viewer not in the right direction
	        if( (cosNH < 0.0) || (cosNL <= 0.0) ) {
	            cosNH = 0.0;
	        }

	        // Compute the color values and store in the colors array
	        var tempR = ambientTerm[0] + diffuseTerm[0] * cosNL + specularTerm[0] * Math.pow(cosNH, nPhong[colorIdx]);
	        var tempG = ambientTerm[1] + diffuseTerm[1] * cosNL + specularTerm[1] * Math.pow(cosNH, nPhong[colorIdx]);
	        var tempB = ambientTerm[2] + diffuseTerm[2] * cosNL + specularTerm[2] * Math.pow(cosNH, nPhong[colorIdx]);

			colors[polyIdx][vertIndex] += tempR;

	        // Avoid exceeding 1.0
			if( colors[polyIdx][vertIndex] > 1.0 ) {
				colors[polyIdx][vertIndex] = 1.0;
			}

	        // Avoid exceeding 1.0
			colors[polyIdx][vertIndex + 1] += tempG;

			if( colors[polyIdx][vertIndex + 1] > 1.0 ) {
				colors[polyIdx][vertIndex + 1] = 1.0;
			}

			colors[polyIdx][vertIndex + 2] += tempB;

	        // Avoid exceeding 1.0
			if( colors[polyIdx][vertIndex + 2] > 1.0 ) {
				colors[polyIdx][vertIndex + 2] = 1.0;
			}
	    }
	}
}
