THREE.SurfGeometry = function (  data, labelX, labelY, useTris) {
	
  THREE.Geometry.call( this );
  this.data = data;
  this.labelX = labelX;
  this.labelY = labelY;
	var verts = this.vertices;
	var faces = this.faces;
	var uvs = this.faceVertexUvs[ 0 ];

	useTris = (useTris === undefined) ? false : useTris;

	var i, il, j, p;
	var u, v, stacks = labelX.length - 1, slices = labelY.length - 1;

	var stackCount = stacks + 1;
	var sliceCount = slices + 1;

	for ( i = 0; i <= stacks; i ++ ) {
		for ( j = 0; j <= slices; j ++ ) {
      if (isNaN(labelX[i]) || isNaN(labelX[i]) || isNaN(data[i][j]) )
        verts.push( new THREE.Vector3(0,0,0));
      else
			  verts.push( new THREE.Vector3(labelX[i], labelY[j], data[i][j]) );
		}
	}

	var a, b, c, d;
	var uva, uvb, uvc, uvd;

	for ( i = 0; i < stacks; i ++ ) {

		for ( j = 0; j < slices; j ++ ) {

			a = i * sliceCount + j;
			b = i * sliceCount + j + 1;
			c = (i + 1) * sliceCount + j;
			d = (i + 1) * sliceCount + j + 1;

			uva = new THREE.Vector2( j / slices, i / stacks );
			uvb = new THREE.Vector2( ( j + 1 ) / slices, i / stacks );
			uvc = new THREE.Vector2( j / slices, ( i + 1 ) / stacks );
			uvd = new THREE.Vector2( ( j + 1 ) / slices, ( i + 1 ) / stacks );

			if ( useTris ) {

				faces.push( new THREE.Face3( a, b, c ) );
				faces.push( new THREE.Face3( b, d, c ) );

				uvs.push( [ uva, uvb, uvc ] );
				uvs.push( [ uvb, uvd, uvc ] );

			} else {

				faces.push( new THREE.Face4( a, b, d, c ) );
				uvs.push( [ uva, uvb, uvd, uvc ] );

			}

		}

	}

	this.computeCentroids();
	this.computeFaceNormals();
	this.computeVertexNormals();
};

THREE.SurfGeometry.prototype = Object.create( THREE.Geometry.prototype );



THREE.AxisGeometry = function ( width, height, depth, widthSegments, heightSegments, depthSegments ) {

	THREE.Geometry.call( this );

	var scope = this;

	this.width = width;
	this.height = height;
	this.depth = depth;

	this.widthSegments = widthSegments || 1;
	this.heightSegments = heightSegments || 1;
	this.depthSegments = depthSegments || 1;

	var width_half = this.width / 2;
	var height_half = this.height / 2;
	var depth_half = this.depth / 2;

  //buildPlane( 'z', 'y', - 1, - 1, this.depth, this.height, width_half, 0 ); // px
  buildPlane( 'z', 'y',   1, - 1, this.depth, this.height, - width_half, 1 ); // nx
  //buildPlane( 'x', 'z',   1,   1, this.width, this.depth, height_half, 2 ); // py
  buildPlane( 'x', 'z',   1, - 1, this.width, this.depth, - height_half, 3 ); // ny
  //buildPlane( 'x', 'y',   1, - 1, this.width, this.height, depth_half, 4 ); // pz
  buildPlane( 'x', 'y', - 1, - 1, this.width, this.height, - depth_half, 5 ); // nz

	function buildPlane( u, v, udir, vdir, width, height, depth, materialIndex ) {

		var w, ix, iy,
		gridX = scope.widthSegments,
		gridY = scope.heightSegments,
		width_half = width / 2,
		height_half = height / 2,
		offset = scope.vertices.length;

		if ( ( u === 'x' && v === 'y' ) || ( u === 'y' && v === 'x' ) ) {

			w = 'z';

		} else if ( ( u === 'x' && v === 'z' ) || ( u === 'z' && v === 'x' ) ) {

			w = 'y';
			gridY = scope.depthSegments;

		} else if ( ( u === 'z' && v === 'y' ) || ( u === 'y' && v === 'z' ) ) {

			w = 'x';
			gridX = scope.depthSegments;

		}

		var gridX1 = gridX + 1,
		gridY1 = gridY + 1,
		segment_width = width / gridX,
		segment_height = height / gridY,
		normal = new THREE.Vector3();

		normal[ w ] = depth > 0 ? 1 : - 1;

		for ( iy = 0; iy < gridY1; iy ++ ) {

			for ( ix = 0; ix < gridX1; ix ++ ) {

				var vector = new THREE.Vector3();
				vector[ u ] = ( ix * segment_width - width_half ) * udir;
				vector[ v ] = ( iy * segment_height - height_half ) * vdir;
				vector[ w ] = depth;

				scope.vertices.push( vector );

			}

		}

		for ( iy = 0; iy < gridY; iy++ ) {

			for ( ix = 0; ix < gridX; ix++ ) {

				var a = ix + gridX1 * iy;
				var b = ix + gridX1 * ( iy + 1 );
				var c = ( ix + 1 ) + gridX1 * ( iy + 1 );
				var d = ( ix + 1 ) + gridX1 * iy;

				var face = new THREE.Face4( a + offset, b + offset, c + offset, d + offset );
				face.normal.copy( normal );
				face.vertexNormals.push( normal.clone(), normal.clone(), normal.clone(), normal.clone() );
				face.materialIndex = materialIndex;

				scope.faces.push( face );
				scope.faceVertexUvs[ 0 ].push( [
							new THREE.Vector2( ix / gridX, 1 - iy / gridY ),
							new THREE.Vector2( ix / gridX, 1 - ( iy + 1 ) / gridY ),
							new THREE.Vector2( ( ix + 1 ) / gridX, 1- ( iy + 1 ) / gridY ),
							new THREE.Vector2( ( ix + 1 ) / gridX, 1 - iy / gridY )
						] );

			}

		}

	}

	this.computeCentroids();
	this.mergeVertices();
  	this.setGeometryColor(this);
};
THREE.AxisGeometry.prototype.setGeometryColor = function (geometry)
{
  	geometry.computeBoundingBox();
	zMin = geometry.boundingBox.min.z;
	zMax = geometry.boundingBox.max.z;
	zRange = zMax - zMin;
	var color, point, face, numberOfSides, vertexIndex;
	// faces are indexed using characters
	var faceIndices = [ 'a', 'b', 'c', 'd' ];
	// first, assign colors to vertices as desired
	for ( var i = 0; i < geometry.vertices.length; i++ )
	{
		point = geometry.vertices[ i ];
		color = new THREE.Color( 0x0000ff );
		color.setHSL( 0.7 * (zMax - point.z) / zRange, 1, 0.5 );
		geometry.colors[i] = color; // use this array for convenience
	}
	// copy the colors as necessary to the face's vertexColors array.
	for ( var i = 0; i < geometry.faces.length; i++ )
	{
		face = geometry.faces[ i ];
		numberOfSides = ( face instanceof THREE.Face3 ) ? 3 : 4;
		for( var j = 0; j < numberOfSides; j++ )
		{
			vertexIndex = face[ faceIndices[ j ] ];
			face.vertexColors[ j ] = geometry.colors[ vertexIndex ];
		}
	}
}
THREE.AxisGeometry.prototype = Object.create( THREE.Geometry.prototype );
THREE.BoundBoxHelper = function ( object, hex ) {

	var color = hex || 0x888888;

	this.object = object;

	this.box = new THREE.Box3();
  var geometry = object.geometry;
  geometry.computeBoundingBox();
  var min = geometry.boundingBox.min;
	var max = geometry.boundingBox.max;
  //THREE.Mesh.call( this, new THREE.AxisGeometry( max.x-min.x, max.y-min.y, max.z-min.z ,10,10,10), new THREE.MeshBasicMaterial( { color: color, wireframe: true } ) );
  THREE.Mesh.call( this, new THREE.AxisGeometry( max.x-min.x, max.y-min.y, max.z-min.z), wireMaterial );
  this.name = 'BoundBox';
  this.position = object.position;
};

THREE.BoundBoxHelper.prototype = Object.create( THREE.Mesh.prototype );
THREE.BoundBoxHelper.prototype.update = function () {

	this.box.setFromObject( this.object );

	this.box.size( this.scale );

	this.box.center( this.position );

};
