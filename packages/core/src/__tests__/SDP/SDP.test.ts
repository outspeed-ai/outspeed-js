import { expect, test, describe } from "vitest";

import { SDP } from "../../SDP";

describe("The SDP class", () => {
  test("should be able to filter audio codec correctly.", () => {
    const sdpInput = `v=0
o=- 0 0 IN IP4 127.0.0.1
s=-
c=IN IP4 127.0.0.1
t=0 0
m=audio 9 RTP/AVP 0 8 97
a=rtpmap:0 PCMU/8000
a=rtpmap:8 PCMA/8000
a=rtpmap:97 opus/48000/2`;

    const filteredSDP = SDP.filter(sdpInput, "audio", "PCMU/8000");
    expect(filteredSDP).toContain("a=rtpmap:0 PCMU/8000");
    expect(filteredSDP).not.toContain("a=rtpmap:8 PCMA/8000");
    expect(filteredSDP).not.toContain("a=rtpmap:97 opus/48000/2");
  });

  test("should be able to filter video codec correctly.", () => {
    const sdpInput = `v=0
o=- 0 0 IN IP4 127.0.0.1
s=-
c=IN IP4 127.0.0.1
t=0 0
m=video 9 RTP/AVP 96 97 98
a=rtpmap:96 VP8/90000
a=rtpmap:97 VP9/90000
a=rtpmap:98 H264/90000`;

    const filteredSDP = SDP.filter(sdpInput, "video", "VP8/90000");

    expect(filteredSDP).toContain("a=rtpmap:96 VP8/90000");
    expect(filteredSDP).not.toContain("a=rtpmap:97 VP9/90000");
    expect(filteredSDP).not.toContain("a=rtpmap:98 H264/90000");
  });
});
