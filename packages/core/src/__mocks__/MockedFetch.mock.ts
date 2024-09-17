/* eslint-disable @typescript-eslint/no-explicit-any */
export function getMockedFetch() {
  let shouldResolve = true;
  let response: any;
  let called = 0;

  function update(
    _shouldResolve: boolean,
    _shouldReject: boolean,
    _res: any,
    _called: number
  ) {
    shouldResolve = _shouldResolve;
    response = _res;
    called = _called || 0;
  }

  function totalCalled() {
    return called;
  }

  function json() {
    return Promise.resolve(response);
  }

  return {
    update,
    totalCalled,
    fetch: () => {
      called += 1;
      if (shouldResolve) {
        return Promise.resolve({
          ok: true,
          json,
        });
      }

      return Promise.reject(new Error("Failed to fetch"));
    },
  };
}
