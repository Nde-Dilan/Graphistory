import * as THREE from 'three';

// Golden Angle for sphere distribution
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

export function getSpherePoints(count: number, radius: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2; // y goes from 1 to -1
    const r = Math.sqrt(1 - y * y); // radius at y

    const theta = GOLDEN_ANGLE * i;

    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;

    points.push(new THREE.Vector3(x * radius, y * radius, z * radius));
  }
  return points;
}

export function getNamePoints(count: number): THREE.Vector3[] {
    const points: THREE.Vector3[] = [];
    const word = "GEMINI";
    const pointsPerLetter = Math.floor(count / word.length);
    const letterSpacing = 8;
    const totalWidth = (word.length - 1) * letterSpacing;
    const startX = -totalWidth / 2;
    const scale = 4;

    const letterShapes: Record<string, [number, number][]> = {
        'G': [[1,2],[0,1],[0,-1],[1,-2],[2,-2],[2,-1],[1,-1]],
        'E': [[2,2],[0,2],[0,0],[1,0],[0,0],[0,-2],[2,-2]],
        'M': [[0,-2],[0,2],[1,0],[2,2],[2,-2]],
        'I': [[0,-2],[0,2]],
        'N': [[0,-2],[0,2],[2,-2],[2,2]],
    };
    
    let pointIndex = 0;

    for (let i = 0; i < word.length; i++) {
        const char = word[i];
        const letterPoints = (char === 'I' && i === 5) ? letterShapes['I'] : (letterShapes[char] || []);
        const letterStartX = startX + i * letterSpacing;
        
        if (letterPoints.length === 0) continue;

        let totalLength = 0;
        const segments: {start: THREE.Vector2, end: THREE.Vector2, length: number}[] = [];

        for(let j = 0; j < letterPoints.length -1; j++) {
            const p1 = new THREE.Vector2(...letterPoints[j]);
            const p2 = new THREE.Vector2(...letterPoints[j+1]);
            const length = p1.distanceTo(p2);
            segments.push({start: p1, end: p2, length});
            totalLength += length;
        }

        let pointsForThisLetter = pointsPerLetter;
        if(i === word.length - 1) {
            pointsForThisLetter = count - pointIndex;
        }

        for (const segment of segments) {
            const numPointsInSegment = Math.round((segment.length / totalLength) * pointsForThisLetter);
            for(let k = 0; k < numPointsInSegment && pointIndex < count; k++) {
                const t = k / (numPointsInSegment-1 || 1);
                const point = new THREE.Vector2().lerpVectors(segment.start, segment.end, t);
                points.push(new THREE.Vector3(
                    (point.x * scale / 2) + letterStartX,
                    point.y * scale,
                    0
                ));
                pointIndex++;
            }
        }
    }

    // If not enough points, fill up
    while(pointIndex < count) {
        points.push(points[points.length - 1] || new THREE.Vector3());
        pointIndex++;
    }

    return points;
}


export function getGridPoints(count: number, size: number): THREE.Vector3[] {
    const points: THREE.Vector3[] = [];
    const numCols = Math.ceil(Math.sqrt(count * (window.innerWidth / window.innerHeight)));
    const numRows = Math.ceil(count / numCols);
    const spacing = size + 1;

    for (let i = 0; i < count; i++) {
        const row = Math.floor(i / numCols);
        const col = i % numCols;

        const x = (col - (numCols - 1) / 2) * spacing;
        const y = -(row - (numRows - 1) / 2) * spacing;

        points.push(new THREE.Vector3(x, y, 0));
    }
    return points;
}
