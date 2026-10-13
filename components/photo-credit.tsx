const credits: Record<string, { name: string; url: string; license: string; licenseUrl: string }> =
  {
    "example-golf": {
      name: "Alexander Migl",
      url: "https://commons.wikimedia.org/wiki/File:VW_Golf_GTI_TCR_1X7A6182.jpg",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    },
    "example-toyota": {
      name: "Mr.choppers",
      url: "https://commons.wikimedia.org/wiki/File:2023_Toyota_Corolla_Cross_XLE_4WD_in_Wind_Chill_Pearl,_front_left.jpg",
      license: "CC BY-SA 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
    },
  };
export function PhotoCredit({ id }: { id: string }) {
  const credit = credits[id];
  return credit ? (
    <p className="mt-3 text-[10px] leading-relaxed text-slate-400">
      Photo:{" "}
      <a className="underline" href={credit.url} target="_blank" rel="noreferrer">
        {credit.name}
      </a>{" "}
      ·{" "}
      <a className="underline" href={credit.licenseUrl} target="_blank" rel="noreferrer">
        {credit.license}
      </a>{" "}
      · resized to WebP
    </p>
  ) : null;
}
