import "./styles.css";
import { astar } from "./astar";

const TILES_WIDTH = 30;
const TILES_HEIGHT = 20;
const BUILDINGS_NUMBER = 5;
const TREES_NUMBER = 10;

const TILETYPES = {
  untouched: 0,
  road: 1,
  building: 2,
  tree: 3,
  water: 4,
  grass: 5,
};

var buildingIndexes = [];

var currNodesArray = [...Array(TILES_HEIGHT)].map((curr, yPos) =>
  [...Array(TILES_WIDTH)].map((curr, xPos) => {
    return {
      tileType: 0,
      pos: {
        x: xPos,
        y: yPos,
      },
    };
  })
);

function resetCurrNodesArray() {
  currNodesArray = [...Array(TILES_HEIGHT)].map((curr, yPos) =>
    [...Array(TILES_WIDTH)].map((curr, xPos) => {
      return {
        tileType: 0,
        pos: {
          x: xPos,
          y: yPos,
        },
      };
    })
  );
}

function drawBuildings(buildingNumber = BUILDINGS_NUMBER) {
  //reset global buildings
  buildingIndexes = [];

  for (let i = 0; i < buildingNumber; i++) {
    let newPos = { y: 0, x: 0 };

    let safetyTries = 50;
    let found = false;

    while (safetyTries >= 0 && !found) {
      newPos.y = Math.floor(Math.random() * TILES_HEIGHT);
      newPos.x = Math.floor(Math.random() * TILES_WIDTH);

      if (currNodesArray[newPos.y][newPos.x].tileType == TILETYPES.untouched) {
        currNodesArray[newPos.y][newPos.x].tileType = TILETYPES.building;

        buildingIndexes.push(newPos);

        found = true;
      }

      safetyTries--;

      if (safetyTries == 0) {
        alert("hey, couldn't build the map!");
      }
    }
  }
}

//each road connects two buildings or meets another road
function drawRoads() {
  const map = astar();

  for (let i = 0; i < buildingIndexes.length; i++) {
    map.init(currNodesArray);

    var destination = i;

    while (destination == i) {
      destination = Math.floor(Math.random() * buildingIndexes.length);
    }

    var newSearch = map.search(
      buildingIndexes[i],
      buildingIndexes[destination]
    );

    currNodesArray = drawRoad(currNodesArray, newSearch.path);
  }
}

function drawRoad(map, path) {
  let newMap = map;

  path.some((curr) => {
    let currentTile = newMap[curr.pos.y][curr.pos.x];

    if ([TILETYPES.road, TILETYPES.building].includes(currentTile.tileType)) {
      return true;
    }

    currentTile.tileType =
      currentTile.tileType == 0 ? TILETYPES.road : currentTile.tileType;
    return false;
  });

  return newMap;
}

function getNeighborNodes(pivotNode) {
  const posY = pivotNode.pos.y;
  const posX = pivotNode.pos.x;
  const neighbourNodes = [9];

  if (posX == 0) {
    neighbourNodes[0] = -1;
    neighbourNodes[3] = -1;
    neighbourNodes[6] = -1;
  } else if (posX == TILES_WIDTH - 1) {
    neighbourNodes[2] = -1;
    neighbourNodes[5] = -1;
    neighbourNodes[8] = -1;
  }

  if (posY == 0) {
    neighbourNodes[0] = -1;
    neighbourNodes[1] = -1;
    neighbourNodes[2] = -1;
  } else if (posY == TILES_HEIGHT - 1) {
    neighbourNodes[6] = -1;
    neighbourNodes[7] = -1;
    neighbourNodes[8] = -1;
  }

  neighbourNodes[0] =
    neighbourNodes[0] != -1 ? currNodesArray[posY - 1][posX - 1] : -1;
  neighbourNodes[1] =
    neighbourNodes[1] != -1 ? currNodesArray[posY - 1][posX] : -1;
  neighbourNodes[2] =
    neighbourNodes[2] != -1 ? currNodesArray[posY - 1][posX + 1] : -1;
  neighbourNodes[3] =
    neighbourNodes[3] != -1 ? currNodesArray[posY][posX - 1] : -1;
  neighbourNodes[4] = pivotNode;
  neighbourNodes[5] =
    neighbourNodes[5] != -1 ? currNodesArray[posY][posX + 1] : -1;
  neighbourNodes[6] =
    neighbourNodes[6] != -1 ? currNodesArray[posY + 1][posX - 1] : -1;
  neighbourNodes[7] =
    neighbourNodes[7] != -1 ? currNodesArray[posY + 1][posX] : -1;
  neighbourNodes[8] =
    neighbourNodes[8] != -1 ? currNodesArray[posY + 1][posX + 1] : -1;

  return neighbourNodes;
}

function writeOnCanvas(tilesArray = currNodesArray, isError = false) {
  if (isError) {
    document.querySelector("#canvas").innerHTML = tilesArray;
    return;
  }

  let element = document.querySelector("#canvas");

  var tiles = "";

  for (var yPos = 0; yPos < tilesArray.length; yPos++) {
    for (var xPos = 0; xPos < tilesArray[yPos].length; xPos++) {
      tiles += tilesArray[yPos][xPos].tileType;
    }
    tiles += "<br>";
  }

  element.innerHTML = tiles;
}

function drawWater(poolSize) {
  const waterArray = [];

  const newPos = {
    y: Math.floor(Math.random() * TILES_HEIGHT),
    x: Math.floor(Math.random() * TILES_WIDTH),
  };

  let newNode = currNodesArray[newPos.y][newPos.x];

  if (!newNode) {
    console.log("Warning: ", newNode, currNodesArray, newPos);
  }

  findNextWaterNode(poolSize, newNode, waterArray);

  //there is no buildings on the surrounders && dont divide the map in 2pickedNumber
  //is untouched
  //the most blocks of water the better the higher the rank

  // let neighbors = getNeighborNodes(newNode);

  // if (
  //   newNode.tileType == TILETYPES.untouched &&
  //   neighbors.every(
  //     (node) => node === -1 || node.tileType === 0
  //   )
  // ) {
}

function findNextWaterNode(count, current, waterArray, safeTry = 10) {
  if (!current) {
    console.log("Warning: ", current, waterArray, count);
  }
  if (current.tileType !== TILETYPES.water) {
    waterArray.push(current);
    currNodesArray[current.pos.y][current.pos.x].tileType = TILETYPES.water;
  }

  if (count == 1) {
    return waterArray;
  }

  //Remove intruders
  var neighborNodes = getNeighborNodes(current).filter(
    (node) =>
      node !== -1 &&
      node.pos !== current.pos &&
      node.tileType !== TILETYPES.water
  );

  //No neighborNode undiscovered left
  if (!Array.isArray(neighborNodes) || !neighborNodes.length) {
    return findNextWaterNode(
      count,
      waterArray[Math.floor(Math.random() * waterArray.length)],
      waterArray,
      safeTry - 1
    );
  }

  neighborNodes.map((neighborNode) => {
    let neighborNodeNeighbours = getNeighborNodes(neighborNode);

    //Remove intruders
    let countWaterNeighbours = neighborNodeNeighbours.filter(
      (node) =>
        node !== -1 &&
        node.tileType == TILETYPES.water &&
        node.pos !== neighborNode.pos
    ).length;

    //lets get the one with highest score
    neighborNode.waterNeighbours = Math.max(
      countWaterNeighbours,
      neighborNode.waterNeighbours ? neighborNode.waterNeighbours : 0
    );
  });

  let newNode = neighborNodes.reduce((max = 0, node) =>
    max.waterNeighbours > node.waterNeighbours ? max : node
  );

  //move to next water node
  return findNextWaterNode(count - 1, newNode, waterArray);
}

{
  setInterval(function () {
    resetCurrNodesArray();

    drawBuildings();

    drawWater(20);
    drawWater(20);
    drawWater(20);

    drawRoads();

    writeOnCanvas();
  }, 500);
}
