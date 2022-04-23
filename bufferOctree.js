class VoxelBufferOctree {
    constructor(voxelSize, boundary = new THREE.Box3(), bytes = Infinity) {
        
        let maxBytes = ( Math.abs( boundary.max.x - boundary.min.x ) * Math.abs( boundary.max.y - boundary.min.y ) * Math.abs( boundary.max.z - boundary.min.z ) ) * ( Math.round( Math.log2( this.getBoundarySize(boundary.min.x,boundary.min.y,boundary.min.z, boundary.max.x,boundary.max.y,boundary.max.z) ) / voxelSize ) * ( 10 * 8 ) );
        
        this.main = new Float32Array( Math.min( bytes, maxBytes + 5 ) );
        
        this.main[0] = voxelSize;
        this.main[1] = 5; //index referring to free space where children can be stored
        this.main[2] = -1; //center X
        this.main[3] = -1; //center Y
        this.main[4] = -1; //center Z
        
        this.setChild( boundary.min.x, boundary.min.y, boundary.min.z, boundary.max.x, boundary.max.y, boundary.max.z );
    }
    
    renderPoint(scene, x,y,z, size, color) {
        var dotGeometry = new THREE.BufferGeometry();
        dotGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( [x,y,z], 3 ) );
        var dotMaterial = new THREE.PointsMaterial( { size: size, color: color } );
        var dot = new THREE.Points( dotGeometry, dotMaterial );
        scene.add( dot );

    }
    
    pointInBoundary(minX,minY,minZ, maxX,maxY,maxZ, x, y, z) {
        return x >= minX && x <= maxX && y >= minY && y <= maxY && z >= minZ && z <= maxZ;
    }
    
    getBoundarySize(minX,minY,minZ, maxX,maxY,maxZ) {
        return Math.abs( ( (maxX - minX) + (maxY - minY) + (maxZ - minZ)) / 3 );
    }
    
    getBoundary(index) {
        let boundMin = new THREE.Vector3( this.main[index + 0], this.main[index + 1], this.main[index + 2] );
        let boundMax = new THREE.Vector3( this.main[index + 3], this.main[index + 4], this.main[index + 5] );
        
        return new THREE.Box3( boundMin, boundMax );
    }
    
    isFinal(index) {
        return this.main[ index + 7 ] === 1;
    }
    
    hasChildren(index) {
        return this.main[ index + 6 ] !== -1;
    }

    setFinal(x, y, z, index) {
        this.main[index + 0] = x;
        this.main[index + 1] = y;
        this.main[index + 2] = z;        
        
        this.main[index + 7] = 1;
    }
    
    setChild(minX,minY,minZ, maxX,maxY,maxZ, index, nextChild = -1, isFinal = -1) {
        let i = index ?? this.main[1];
        
        this.main[i + 0] = minX;
        this.main[i + 1] = minY;
        this.main[i + 2] = minZ;
        
        this.main[i + 3] = maxX;
        this.main[i + 4] = maxY;
        this.main[i + 5] = maxZ;
        
        this.main[i + 6] = nextChild; //nextChildren location
        
        this.main[i + 7] = isFinal; //isFinal (-1 = false, 1 = true)
        
        if(index === undefined)
            this.main[1] += 8;
    }
    
    visualize(scene, color = 0xffffff, index = 5, pSize = this.main[ 0 ], pColor = 0x00ff00) {
        if(this.isFinal( index ))
        {
            this.renderPoint( scene, this.main[ index + 0 ], this.main[ index + 1 ], this.main[ index + 2 ], pSize, pColor )
            return;
        }
        
        if( !this.hasChildren( index ) )
        {
            const helper = new THREE.Box3Helper( this.getBoundary( index ), color );
            scene.add( helper );
            
            return;
        }
        
        for(let i = 0, l = 8; i < l; i++) {
            let Cindex = this.main[ index + 6 ] + 8 * i;
            
            this.visualize( scene, color, Cindex );
        }
    }
    
    setSubChildren(index) {
        var i, l, Cindex, startIndex;
        
        startIndex = this.main[1];
        
        this.main[2] = ( this.main[ index + 0 ] + this.main[ index + 3 ] ) / 2;
        this.main[3] = ( this.main[ index + 1 ] + this.main[ index + 4 ] ) / 2;
        this.main[4] = ( this.main[ index + 2 ] + this.main[ index + 5 ] ) / 2;
        
        this.setChild( this.main[ index + 0 ], this.main[ index + 1 ], this.main[ index + 2 ], this.main[2], this.main[ index + 4 ], this.main[ index + 5 ] );
        
        this.setChild( this.main[2], this.main[ index + 1 ], this.main[ index + 2 ], this.main[ index + 3 ], this.main[ index + 4 ], this.main[ index + 5 ] );
    
        for(i = 0, l = 2; i < l; i++) {
            Cindex = startIndex + 8 * i;
            
            this.setChild( this.main[ Cindex + 0 ], this.main[3], this.main[ Cindex + 2 ], this.main[ Cindex + 3 ], this.main[ Cindex + 4 ], this.main[ Cindex + 5 ] );
            
            this.main[ Cindex + 4 ] = this.main[3];
        }
        
        for(i = 0, l = 4; i < l; i++) {
            Cindex = startIndex + 8 * i;
            
            this.setChild( this.main[ Cindex + 0 ], this.main[ Cindex + 1 ], this.main[4], this.main[ Cindex + 3 ], this.main[ Cindex + 4 ], this.main[ Cindex + 5 ] );
            
            this.main[ Cindex + 5 ] = this.main[4];
        }
    }
    
    addVoxel(x, y, z, index = 5) {
        var boxSize = this.getBoundarySize( this.main[ index + 0 ],this.main[ index + 1 ],this.main[ index + 2 ], this.main[ index + 3 ],this.main[ index + 4 ],this.main[ index + 5 ] );
        
        if(index === 5 && !this.pointInBoundary(this.main[ index + 0 ],this.main[ index + 1 ],this.main[ index + 2 ], this.main[ index + 3 ],this.main[ index + 4 ],this.main[ index + 5 ], x,y,z))
            throw new Error('voxel outside boundary');
        
        if(!this.isFinal( index ) && boxSize <= this.main[0])
        {
            this.setFinal( x, y, z, index );
            
            return true;
        }
        
        if(this.isFinal( index ) && this.main[ index + 0 ] == x && this.main[ index + 1 ] == y && this.main[ index + 2 ] == z)
            throw new Error('voxel already in octree');
        
        if(!this.hasChildren( index ))
        {
            this.main[ index + 6 ] = this.main[1];
            this.setSubChildren( index );
        }
        
        for(let i = 0; i < 8; i++) {
            let Cindex = this.main[ index + 6 ] + 8 * i;
            
            if(this.pointInBoundary(this.main[ Cindex + 0 ],this.main[ Cindex + 1 ],this.main[ Cindex + 2 ], this.main[ Cindex + 3 ],this.main[ Cindex + 4 ],this.main[ Cindex + 5 ], x,y,z) )
                if(this.addVoxel(x, y, z, Cindex) === true)
                    return true;
        }
    }
    
    findVoxel(x, y, z, index = 5) {
        if(this.isFinal( index ) && this.main[ index + 0 ] === x && this.main[ index + 1 ] === y && this.main[ index + 2 ] === z )
            return true;
        
        let boundary = this.getBoundary( index );
        if(!this.pointInBoundary(this.main[ index + 0 ],this.main[ index + 1 ],this.main[ index + 2 ], this.main[ index + 3 ],this.main[ index + 4 ],this.main[ index + 5 ], x,y,z) )
            return false;
        
        for(let i = 0; i < 8; i++) {
            let Cindex = this.main[ index + 6 ] + 8 * i;
            
            if(this.findVoxel(x, y, z, Cindex))    
                return true;
        }
        
        return false;
    }
    
    removeVoxel(x, y, z) {
        
    }
}