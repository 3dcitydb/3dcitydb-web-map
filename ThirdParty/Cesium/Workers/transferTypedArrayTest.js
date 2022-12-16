undefined
if (typeof self === "undefined") {
  self = {};
}
self.onmessage = function(event) {
  const array = event.data.array;
  const postMessage = self.webkitPostMessage || self.postMessage;
  try {
    postMessage(
      {
        array
      },
      [array.buffer]
    );
  } catch (e) {
    postMessage({});
  }
};
