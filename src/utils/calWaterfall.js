export const calWaterfall = (domRef, positionArr, beginIndex) => {
  let position;
  if (positionArr !== undefined) {
    position = positionArr;
  } else {
    position = new Array(2); // 计算每一列元素应该放置的位置
    position.fill(0);
  }

  let index = 0;
  if (beginIndex !== undefined) {
    index = beginIndex;
  }
  for (let i = index; i < domRef.children.length; i++) {
    const domHeight = domRef.children[i].offsetHeight;
    if (position[0] <= position[1]) {
      domRef.children[i].style =
        `top: ` + position[0] + `px;` + `left:0;`;
      position[0] += domHeight;
    } else {
      domRef.children[i].style =
        `top: ` + position[1] + `px;` + `right:0;`;
      position[1] += domHeight;
    }
  }
  if (position[0] <= position[1]) {
    domRef.style = `height:` + position[1] + `px`;
  } else {
    domRef.style = `height:` + position[0] + `px`;
  }
  return position;
};
