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
    const letterSpacing = 6;
    const scale = 3;
    
    const letterShapes: Record<string, [number, number][]> = {
        'C': [[2, 1.5], [1, 2], [0, 1], [0, -1], [1, -2], [2, -1.5]],
        'A': [[0, -2], [0, 0], [1, 2], [2, 0], [2, -2]],
        'M': [[0, -2], [0, 2], [1, 0], [2, 2], [2, -2]],
        'E': [[2, 2], [0, 2], [0, 0], [1.5, 0], [0, 0], [0, -2], [2, -2]],
        'R': [[0, -2], [0, 2], [2, 1], [0, 0], [2,-2]],
        'O': [[1, 2], [0, 1], [0, -1], [1, -2], [2, -1], [2, 1], [1, 2]],
        'N': [[0,-2], [0,2], [2,-2], [2,2]],
    };

    const totalLetters = word.length;
    const pointsPerLetter = Math.floor(count / totalLetters);
    let remainder = count % totalLetters;

    const totalWidth = (totalLetters - 1) * letterSpacing;
    const startX = -totalWidth / 2;

    let pointIndex = 0;

    for (let i = 0; i < totalLetters; i++) {
        const char = word[i];
        const letterPoints = letterShapes[char];
        if (!letterPoints || letterPoints.length < 2) continue;

        const letterStartX = startX + i * letterSpacing;
        
        let numPointsForChar = pointsPerLetter + (remainder > 0 ? 1 : 0);
        if (numPointsForChar <= 0) continue;
        remainder--;

        const path = new THREE.CatmullRomCurve3(
            letterPoints.map(p => new THREE.Vector3(p[0] * scale / 1.5 + letterStartX, p[1] * scale, 0))
        );

        const pathPoints = path.getPoints(numPointsForChar - 1);
        
        for (let j = 0; j < pathPoints.length && pointIndex < count; j++) {
            points.push(pathPoints[j].add(new THREE.Vector3(0, 0, Math.random() * 2 - 1)));
            pointIndex++;
        }
    }

    // Fallback to ensure we always have `count` points.
    while (points.length < count) {
        const lastPoint = points.length > 0 ? points[points.length - 1] : new THREE.Vector3();
        points.push(lastPoint.clone().add(new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)));
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
