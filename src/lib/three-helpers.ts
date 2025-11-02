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
    const word = "CAMEROON";
    const pointsPerLetter = Math.floor(count / word.length);
    const letterSpacing = 6;
    const totalWidth = (word.length - 1) * letterSpacing;
    const startX = -totalWidth / 2;
    const scale = 3;

    const letterShapes: Record<string, [number, number][]> = {
        'C': [[2,1.5],[1,2],[0,1],[0,-1],[1,-2],[2,-1.5]],
        'A': [[0,-2],[0,0],[1,2],[2,0],[2,-2],[0,-2],[2,0]],
        'M': [[0,-2],[0,2],[1,0],[2,2],[2,-2]],
        'E': [[2,2],[0,2],[0,0],[1.5,0],[0,0],[0,-2],[2,-2]],
        'R': [[0,-2],[0,2],[2,1],[0,0],[2,-2]],
        'O': [[1,2],[0,1],[0,-1],[1,-2],[2,-1],[2,1],[1,2]],
        'N': [[0,-2],[0,2],[2,-2],[2,2]],
    };
    
    let pointIndex = 0;

    for (let i = 0; i < word.length; i++) {
        const char = word[i];
        const letterPoints = letterShapes[char] || [];
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

        let pointsAddedInLetter = 0;
        for (const segment of segments) {
            // Ensure at least one point per segment for sparse letters
            const numPointsInSegment = Math.max(1, Math.round((segment.length / totalLength) * pointsForThisLetter));
            for(let k = 0; k < numPointsInSegment && pointIndex < count && pointsAddedInLetter < pointsForThisLetter; k++) {
                const t = (numPointsInSegment > 1) ? k / (numPointsInSegment - 1) : 0;
                const point = new THREE.Vector2().lerpVectors(segment.start, segment.end, t);
                points.push(new THREE.Vector3(
                    (point.x * scale / 1.5) + letterStartX,
                    point.y * scale,
                    Math.random() * 2 - 1 // Add a little depth
                ));
                pointIndex++;
                pointsAddedInLetter++;
            }
        }
    }

    // If not enough points, fill up the remaining
    while(pointIndex < count) {
        const lastPoint = points[points.length-1] || new THREE.Vector3();
        points.push(lastPoint.clone().add(new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5)));
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
