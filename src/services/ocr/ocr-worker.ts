/* eslint-disable no-async-promise-executor */
import { pipeline, env } from '@huggingface/transformers';

let ocr: any = undefined;

self.onmessage = async (e) => {
    if (e.data.type === 'ocr') {
        return new Promise((resolve) => {
            runOCR(e.data.blob).then((textData: any) => {
                self.postMessage({
                    type: 'ocr',
                    text: textData
                });
                resolve(textData);
            })
        })
    }
    else if (e.data.type === "load") {
        return new Promise(async (resolve) => {
            await loadOCR(e.data.model);

            self.postMessage({
                type: 'loaded'
            });
            resolve(ocr);
        });
    }
    else {
        return Promise.reject('Unknown message type');
    }
}

async function runOCR(image: Blob) {
    return new Promise(async (resolve) => {
        const out = await ocr(image);
        resolve(out);
    });
}

async function loadOCR(model: string): Promise<void> {
    return new Promise(async (resolve) => {
        if (!ocr) {
            env.allowLocalModels = false;
            env.useBrowserCache = false;
            ocr = await pipeline('image-to-text', model || 'Xenova/trocr-small-printed', {
                device: "webgpu"
            });
            console.log("loaded ocr", ocr)
            resolve();
        }
        else {
            resolve();
        }
    });
}