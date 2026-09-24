export function isContractCompatible(
  reportedVersion: string,
  supportedVersion: string = process.env.SUPPORTED_CONTRACT_VERSION!,
): boolean {
  const reported = parseSemantic(reportedVersion);
  const supported = parseSemantic(supportedVersion);

  if (!reported || !supported) return false;
  if (reported.major !== supported.major) return false;
  return true;
}

function parseSemantic(v: string) {
  const match = /^(\d+)\.(\d+)(?:\.(\d+))?$/.exec(v);
  if (!match) return null;
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3] ?? 0),
  };
}