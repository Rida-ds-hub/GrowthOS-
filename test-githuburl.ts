import { analyseRepo } from "./githuburl";

async function main() {
  // Change this to any public repo you want to test with
  const url = "https://github.com/Rida-ds-hub/Style_Hub_IE_Project";

  console.log("Analysing repo:", url);

  const result = await analyseRepo(url);

  console.log("\nMETA");
  console.log(JSON.stringify(result.meta, null, 2));

  console.log("\nPATTERNS");
  console.log(JSON.stringify(result.patterns, null, 2));

  console.log("\nCOMPLEXITY");
  console.log(JSON.stringify(result.complexity, null, 2));

  console.log("\nFILE MAP (total, first 10 classified)");
  console.log("Total files:", result.fileMap.total);
  console.log(JSON.stringify(result.fileMap.classified.slice(0, 10), null, 2));

  console.log("\nNOTEBOOK ANALYSIS");
  if (result.notebookAnalysis && result.notebookAnalysis.length > 0) {
    console.log("Notebooks analysed:", result.notebookAnalysis.length);
    console.log("First notebook narrative length:", result.notebookAnalysis[0].narrative?.length ?? 0);
  } else {
    console.log("No notebook content (null or empty)");
  }
}

main().catch((err) => {
  console.error("Error in analyseRepo:", err);
  process.exit(1);
});

