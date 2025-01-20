export const calWaterfall = (domRef) => {
  let position = new Array(2); // 计算每一列元素应该放置的位置
  position.fill(0);
  for (let i = 0; i < domRef.children.length; i++) {
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
};
