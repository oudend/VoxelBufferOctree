# VoxelBufferOctree
Voxel octree built with 1 buffered array for optimized performance. 


![alt text](https://github.com/oudend/VoxelBufferOctree/blob/1594b41ac8c2b251c46975ef73d8086e6e728b65/octree.png "visualized octree")


## EXAMPLE

```javascript

var boundary = new THREE.Box3( new THREE.Vector3(-10, -10, -10), new THREE.Vector3(10, 10, 10) );
var bufferOctree = new VoxelBufferOctree( 1, boundary );

bufferOctree.addVoxel( 0, 0, 0 );

bufferOctree.visualize(scene);
```
