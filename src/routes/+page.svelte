<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import {
    AspectRatio,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    Input,
    Label,
  } from "$lib";

  let worker: Worker;
  let canvas: HTMLCanvasElement;

  let clientName: string = "";

  async function initWebWorker() {
    if (!browser || !window.Worker) return;

    const Worker = await import("$lib/workers/psd.worker?worker");

    worker = new Worker.default();
    worker.onmessage = function (
      e: MessageEvent<
        {
          [key: string]: string;
          // } & { imageData: ImageData } & {
        } & { imageData: Uint8ClampedArray } & {
          width: number;
          height: number;
        }
      >,
    ) {
      const { status, psd, imageData: rgba, width, height } = e.data;

      const context = canvas.getContext("2d")!;

      // canvas.width = imageData.width;
      // canvas.height = imageData.height;

      canvas.width = width;
      canvas.height = height;

      const imageData = context.createImageData(width, height);
      imageData.data.set(rgba);
      context.putImageData(imageData, 0, 0);

      // canvas.getContext("bitmaprenderer")?.transferFromImageBitmap(bitmap);
      // canvas.getContext("2d")?.putImageData(imageData, 0, 0);
    };
  }

  function terminateWebWorker() {
    if (!worker) return;
    worker.terminate();
  }

  async function startWorker() {
    if (!worker) return;
    worker.postMessage(clientName);
  }

  async function stopWorker() {
    terminateWebWorker();
    await initWebWorker();
  }

  onMount(() => {
    initWebWorker().then(() => {
      worker.postMessage("Mockup Generator");
    });
  });

  onDestroy(() => {
    terminateWebWorker();
  });
</script>

<Card class="mt-10">
  <CardHeader>
    <CardTitle>PSD Mockup Generator</CardTitle>
    <CardDescription class="text-balance">
      Lorem ipsum dolor, sit amet consectetur adipisicing elit. Nesciunt, in.
      Quam deserunt accusamus atque eveniet, quos illum deleniti dolorem id,
      vero sunt cumque harum aliquid quo voluptatibus dolorum earum libero.
    </CardDescription>
  </CardHeader>

  <CardContent class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
    <div class="space-y-4">
      <div class="">
        <Label for="name">Ismingizni kiriting:</Label>
        <Input
          id="name"
          name="name"
          autocomplete="name"
          bind:value={clientName}
        />
      </div>

      <Button on:click={startWorker}>Generate</Button>
    </div>

    <div class="row-start-1 md:row-start-auto">
      <!-- <AspectRatio ratio={16 / 12} class="overflow-hidden rounded-lg">
        
      </AspectRatio> -->

      <AspectRatio ratio={16 / 12} class="overflow-hidden rounded-lg">
        <canvas bind:this={canvas} id="result-canvas" class="w-full"></canvas>
      </AspectRatio>
    </div>
  </CardContent>
</Card>
