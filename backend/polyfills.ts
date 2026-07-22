import util from "util";

if (!(util as any).isNullOrUndefined) {
  (util as any).isNullOrUndefined = (value: any) =>
    value === null || value === undefined;
}
