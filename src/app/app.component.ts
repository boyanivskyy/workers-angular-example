import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
    readonly numberOfIterations = 1000000000;
    readonly numberOfWorkers = 10;

    constructor() {}

    ngOnInit() {
        console.log('execTime numberOfIterations', this.numberOfIterations);
        console.log(
            'execTime numberOfWorkers or deepness of loop if single thread',
            this.numberOfWorkers
        );

        const start = performance.now();
        for (let i = 0; i < this.numberOfIterations; i++) {
            for (let j = 0; j < this.numberOfWorkers; j++) {}
        }

        const execTime = performance.now() - start;
        console.log('execTime without worker', execTime);
        // ####################################
        const start1 = performance.now();
        this.execInWorker({
            numberOfIterations: this.numberOfIterations,
            deepness: this.numberOfWorkers,
        }).then((result) => {
            const execTime = performance.now() - start1;
            console.log('execTime for everything in worker', execTime);
        });

        // ####################################
        const start2 = performance.now();
        this.execInWorker2().then((result) => {
            const execTime = performance.now() - start2;
            console.log(
                'execTime creating new worker for each deepness value',
                execTime
            );
        });
    }

    private execInWorker<T extends any>(params: any): Promise<T> {
        return new Promise((resolve, reject) => {
            if (typeof Worker === 'undefined') {
                reject('Web workers are not supported in this environment');
                return;
            }

            const worker = new Worker(
                new URL('./iterator.worker.ts', import.meta.url),
                {
                    type: 'module',
                }
            );

            worker.onmessage = ({ data }) => {
                resolve(data);
            };

            worker.postMessage(params);
        });
    }

    // create worker for in each iteration on deepness and merge results
    private execInWorker2<T extends any>(): Promise<T> {
        const workers = [];
        for (let i = 0; i < this.numberOfWorkers; i++) {
            workers.push(
                new Promise((resolve, reject) => {
                    // create worker
                    const worker = new Worker(
                        new URL('./iterator.worker.ts', import.meta.url),
                        {
                            type: 'module',
                        }
                    );

                    // listen for message
                    worker.onmessage = ({ data }) => {
                        resolve(data);
                    };

                    // post message
                    worker.postMessage({
                        numberOfIterations: this.numberOfIterations,
                        deepness: 1,
                    });
                })
            );
        }

        return Promise.all(workers) as Promise<T>;
    }
}
