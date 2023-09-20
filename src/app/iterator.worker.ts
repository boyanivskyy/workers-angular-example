/// <reference lib="webworker" />

addEventListener('message', (event) => {
    const { numberOfIterations, deepness } = event.data;
    let couterForFun = 0;

    for (let i = 0; i < numberOfIterations; i++) {
        couterForFun++;
        if (deepness > 1) {
            for (let j = 0; j < deepness; j++) {
                couterForFun++;
            }
        }
    }

    postMessage('done');
    close();
});
