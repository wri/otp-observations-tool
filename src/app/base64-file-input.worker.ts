/// <reference lib="webworker" />

addEventListener('message', ({ data }) => {
  try {
    const fileReader = new FileReader();

    fileReader.addEventListener('load', ({ target}: Event) => {
      postMessage(((target as FileReader).result as string));
    });
    fileReader.addEventListener('error', (err) => {
      postMessage({ error: err });
    });

    fileReader.readAsDataURL(data.file);
  } catch (err) {
    postMessage({ error: err });
  }
});
