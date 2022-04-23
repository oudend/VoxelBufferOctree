# VoxelBufferOctree
Voxel octree built with 1 buffered array for optimized performance. 


## ADD IMAGE HERE


## EXAMPLE

```javascript

var boundary = new THREE.Box3( new THREE.Vector3(-10, -10, -10), new THREE.Vector3(10, 10, 10) );
var bufferOctree = new VoxelBufferOctree( 1, boundary );

bufferOctree.addVoxel( 0, 0, 0 );

bufferOctree.visualize(scene);
```
