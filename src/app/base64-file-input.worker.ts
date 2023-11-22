/// <reference lib="webworker" />

addEventListener('message', ({ data }) => {
  try {
    const fileReader = new FileReader();

    fileReader.addEventListener('load', ({ target}: Event) => {
      postMessage((<string>(<FileReader>target).result));
    });
    fileReader.addEventListener('error', (err) => {
      postMessage({ error: err });
    });

    fileReader.readAsDataURL(data.file);
  } catch (err) {
    postMessage({ error: err });
  }
});
