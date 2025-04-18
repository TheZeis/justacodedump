/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[Object.keys(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// node_modules/node-webvtt/lib/parser.js
var require_parser = __commonJS({
  "node_modules/node-webvtt/lib/parser.js"(exports, module2) {
    "use strict";
    function ParserError(message, error) {
      this.message = message;
      this.error = error;
    }
    ParserError.prototype = Object.create(Error.prototype);
    var TIMESTAMP_REGEXP = /([0-9]{1,2})?:?([0-9]{2}):([0-9]{2}\.[0-9]{2,3})/;
    function parse2(input, options) {
      if (!options) {
        options = {};
      }
      const { meta = false, strict = true } = options;
      if (typeof input !== "string") {
        throw new ParserError("Input must be a string");
      }
      input = input.trim();
      input = input.replace(/\r\n/g, "\n");
      input = input.replace(/\r/g, "\n");
      const parts = input.split("\n\n");
      const header = parts.shift();
      if (!header.startsWith("WEBVTT")) {
        throw new ParserError('Must start with "WEBVTT"');
      }
      const headerParts = header.split("\n");
      const headerComments = headerParts[0].replace("WEBVTT", "");
      if (headerComments.length > 0 && (headerComments[0] !== " " && headerComments[0] !== "	")) {
        throw new ParserError("Header comment must start with space or tab");
      }
      if (parts.length === 0 && headerParts.length === 1) {
        return { valid: true, strict, cues: [], errors: [] };
      }
      if (!meta && headerParts.length > 1 && headerParts[1] !== "") {
        throw new ParserError("Missing blank line after signature");
      }
      const { cues, errors } = parseCues(parts, strict);
      if (strict && errors.length > 0) {
        throw errors[0];
      }
      const headerMeta = meta ? parseMeta(headerParts) : null;
      const result = { valid: errors.length === 0, strict, cues, errors };
      if (meta) {
        result.meta = headerMeta;
      }
      return result;
    }
    function parseMeta(headerParts) {
      const meta = {};
      headerParts.slice(1).forEach((header) => {
        const splitIdx = header.indexOf(":");
        const key = header.slice(0, splitIdx).trim();
        const value = header.slice(splitIdx + 1).trim();
        meta[key] = value;
      });
      return Object.keys(meta).length > 0 ? meta : null;
    }
    function parseCues(cues, strict) {
      const errors = [];
      const parsedCues = cues.map((cue, i) => {
        try {
          return parseCue(cue, i, strict);
        } catch (e) {
          errors.push(e);
          return null;
        }
      }).filter(Boolean);
      return {
        cues: parsedCues,
        errors
      };
    }
    function parseCue(cue, i, strict) {
      let identifier = "";
      let start = 0;
      let end = 0.01;
      let text = "";
      let styles = "";
      const lines = cue.split("\n").filter(Boolean);
      if (lines.length > 0 && lines[0].trim().startsWith("NOTE")) {
        return null;
      }
      if (lines.length === 1 && !lines[0].includes("-->")) {
        throw new ParserError(`Cue identifier cannot be standalone (cue #${i})`);
      }
      if (lines.length > 1 && !(lines[0].includes("-->") || lines[1].includes("-->"))) {
        const msg = `Cue identifier needs to be followed by timestamp (cue #${i})`;
        throw new ParserError(msg);
      }
      if (lines.length > 1 && lines[1].includes("-->")) {
        identifier = lines.shift();
      }
      const times = typeof lines[0] === "string" && lines[0].split(" --> ");
      if (times.length !== 2 || !validTimestamp(times[0]) || !validTimestamp(times[1])) {
        throw new ParserError(`Invalid cue timestamp (cue #${i})`);
      }
      start = parseTimestamp(times[0]);
      end = parseTimestamp(times[1]);
      if (strict) {
        if (start > end) {
          throw new ParserError(`Start timestamp greater than end (cue #${i})`);
        }
        if (end <= start) {
          throw new ParserError(`End must be greater than start (cue #${i})`);
        }
      }
      if (!strict && end < start) {
        throw new ParserError(`End must be greater or equal to start when not strict (cue #${i})`);
      }
      styles = times[1].replace(TIMESTAMP_REGEXP, "").trim();
      lines.shift();
      text = lines.join("\n");
      if (!text) {
        return false;
      }
      return { identifier, start, end, text, styles };
    }
    function validTimestamp(timestamp) {
      return TIMESTAMP_REGEXP.test(timestamp);
    }
    function parseTimestamp(timestamp) {
      const matches = timestamp.match(TIMESTAMP_REGEXP);
      let secs = parseFloat(matches[1] || 0) * 60 * 60;
      secs += parseFloat(matches[2]) * 60;
      secs += parseFloat(matches[3]);
      return secs;
    }
    module2.exports = { ParserError, parse: parse2 };
  }
});

// node_modules/node-webvtt/lib/compiler.js
var require_compiler = __commonJS({
  "node_modules/node-webvtt/lib/compiler.js"(exports, module2) {
    "use strict";
    function CompilerError(message, error) {
      this.message = message;
      this.error = error;
    }
    CompilerError.prototype = Object.create(Error.prototype);
    function compile(input) {
      if (!input) {
        throw new CompilerError("Input must be non-null");
      }
      if (typeof input !== "object") {
        throw new CompilerError("Input must be an object");
      }
      if (Array.isArray(input)) {
        throw new CompilerError("Input cannot be array");
      }
      if (!input.valid) {
        throw new CompilerError("Input must be valid");
      }
      let output = "WEBVTT\n";
      if (input.meta) {
        if (typeof input.meta !== "object" || Array.isArray(input.meta)) {
          throw new CompilerError("Metadata must be an object");
        }
        Object.entries(input.meta).forEach((i) => {
          if (typeof i[1] !== "string") {
            throw new CompilerError(`Metadata value for "${i[0]}" must be string`);
          }
          output += `${i[0]}: ${i[1]}
`;
        });
      }
      let lastTime = null;
      input.cues.forEach((cue, index) => {
        if (lastTime && lastTime > cue.start) {
          throw new CompilerError(`Cue number ${index} is not in chronological order`);
        }
        lastTime = cue.start;
        output += "\n";
        output += compileCue(cue);
        output += "\n";
      });
      return output;
    }
    function compileCue(cue) {
      if (typeof cue !== "object") {
        throw new CompilerError("Cue malformed: not of type object");
      }
      if (typeof cue.identifier !== "string" && typeof cue.identifier !== "number" && cue.identifier !== null) {
        throw new CompilerError(`Cue malformed: identifier value is not a string.
    ${JSON.stringify(cue)}`);
      }
      if (isNaN(cue.start)) {
        throw new CompilerError(`Cue malformed: null start value.
    ${JSON.stringify(cue)}`);
      }
      if (isNaN(cue.end)) {
        throw new CompilerError(`Cue malformed: null end value.
    ${JSON.stringify(cue)}`);
      }
      if (cue.start >= cue.end) {
        throw new CompilerError(`Cue malformed: start timestamp greater than end
    ${JSON.stringify(cue)}`);
      }
      if (typeof cue.text !== "string") {
        throw new CompilerError(`Cue malformed: null text value.
    ${JSON.stringify(cue)}`);
      }
      if (typeof cue.styles !== "string") {
        throw new CompilerError(`Cue malformed: null styles value.
    ${JSON.stringify(cue)}`);
      }
      let output = "";
      if (cue.identifier.length > 0) {
        output += `${cue.identifier}
`;
      }
      const startTimestamp = convertTimestamp(cue.start);
      const endTimestamp = convertTimestamp(cue.end);
      output += `${startTimestamp} --> ${endTimestamp}`;
      output += cue.styles ? ` ${cue.styles}` : "";
      output += `
${cue.text}`;
      return output;
    }
    function convertTimestamp(time) {
      const hours = pad(calculateHours(time), 2);
      const minutes = pad(calculateMinutes(time), 2);
      const seconds = pad(calculateSeconds(time), 2);
      const milliseconds = pad(calculateMs(time), 3);
      return `${hours}:${minutes}:${seconds}.${milliseconds}`;
    }
    function pad(num, zeroes) {
      let output = `${num}`;
      while (output.length < zeroes) {
        output = `0${output}`;
      }
      return output;
    }
    function calculateHours(time) {
      return Math.floor(time / 60 / 60);
    }
    function calculateMinutes(time) {
      return Math.floor(time / 60) % 60;
    }
    function calculateSeconds(time) {
      return Math.floor(time % 60);
    }
    function calculateMs(time) {
      return Math.floor((time % 1).toFixed(4) * 1e3);
    }
    module2.exports = { CompilerError, compile };
  }
});

// node_modules/node-webvtt/lib/segmenter.js
var require_segmenter = __commonJS({
  "node_modules/node-webvtt/lib/segmenter.js"(exports, module2) {
    "use strict";
    var parse2 = require_parser().parse;
    function segment(input, segmentLength) {
      segmentLength = segmentLength || 10;
      const parsed = parse2(input);
      const segments = [];
      let cues = [];
      let queuedCue = null;
      let currentSegmentDuration = 0;
      let totalSegmentsDuration = 0;
      parsed.cues.forEach((cue, i) => {
        const firstCue = i === 0;
        const lastCue = i === parsed.cues.length - 1;
        const start = cue.start;
        const end = cue.end;
        const nextStart = lastCue ? Infinity : parsed.cues[i + 1].start;
        const cueLength = firstCue ? end : end - start;
        const silence = firstCue ? 0 : start - parsed.cues[i - 1].end;
        currentSegmentDuration = currentSegmentDuration + cueLength + silence;
        debug("------------");
        debug(`Cue #${i}, segment #${segments.length + 1}`);
        debug(`Start ${start}`);
        debug(`End ${end}`);
        debug(`Length ${cueLength}`);
        debug(`Total segment duration = ${totalSegmentsDuration}`);
        debug(`Current segment duration = ${currentSegmentDuration}`);
        debug(`Start of next = ${nextStart}`);
        if (queuedCue) {
          cues.push(queuedCue);
          currentSegmentDuration += queuedCue.end - totalSegmentsDuration;
          queuedCue = null;
        }
        cues.push(cue);
        let shouldQueue = nextStart - end < segmentLength && silence < segmentLength && currentSegmentDuration > segmentLength;
        if (shouldSegment(totalSegmentsDuration, segmentLength, nextStart, silence)) {
          const duration = segmentDuration(lastCue, end, segmentLength, currentSegmentDuration, totalSegmentsDuration);
          segments.push({ duration, cues });
          totalSegmentsDuration += duration;
          currentSegmentDuration = 0;
          cues = [];
        } else {
          shouldQueue = false;
        }
        if (shouldQueue) {
          queuedCue = cue;
        }
      });
      return segments;
    }
    function shouldSegment(total, length, nextStart, silence) {
      const x = alignToSegmentLength(silence, length);
      const nextCueIsInNextSegment = silence <= length || x + total < nextStart;
      return nextCueIsInNextSegment && nextStart - total >= length;
    }
    function segmentDuration(lastCue, end, length, currentSegment, totalSegments) {
      let duration = length;
      if (currentSegment > length) {
        duration = alignToSegmentLength(currentSegment - length, length);
      }
      if (lastCue) {
        duration = parseFloat((end - totalSegments).toFixed(2));
      } else {
        duration = Math.round(duration);
      }
      return duration;
    }
    function alignToSegmentLength(n, segmentLength) {
      n += segmentLength - n % segmentLength;
      return n;
    }
    var debugging = false;
    function debug(m) {
      if (debugging) {
        console.log(m);
      }
    }
    module2.exports = { segment };
  }
});

// node_modules/node-webvtt/lib/hls.js
var require_hls = __commonJS({
  "node_modules/node-webvtt/lib/hls.js"(exports, module2) {
    "use strict";
    var segment = require_segmenter().segment;
    function hlsSegment(input, segmentLength, startOffset) {
      if (typeof startOffset === "undefined") {
        startOffset = "900000";
      }
      const segments = segment(input, segmentLength);
      const result = [];
      segments.forEach((seg, i) => {
        const content = `WEBVTT
X-TIMESTAMP-MAP=MPEGTS:${startOffset},LOCAL:00:00:00.000

${printableCues(seg.cues)}
`;
        const filename = generateSegmentFilename(i);
        result.push({ filename, content });
      });
      return result;
    }
    function hlsSegmentPlaylist(input, segmentLength) {
      const segmented = segment(input, segmentLength);
      const printable = printableSegments(segmented);
      const longestSegment = Math.round(findLongestSegment(segmented));
      const template = `#EXTM3U
#EXT-X-TARGETDURATION:${longestSegment}
#EXT-X-VERSION:3
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-PLAYLIST-TYPE:VOD
${printable}
#EXT-X-ENDLIST
`;
      return template;
    }
    function pad(num, n) {
      const padding = "0".repeat(Math.max(0, n - num.toString().length));
      return `${padding}${num}`;
    }
    function generateSegmentFilename(index) {
      return `${index}.vtt`;
    }
    function printableSegments(segments) {
      const result = [];
      segments.forEach((seg, i) => {
        result.push(`#EXTINF:${seg.duration.toFixed(5)},
${generateSegmentFilename(i)}`);
      });
      return result.join("\n");
    }
    function findLongestSegment(segments) {
      let max = 0;
      segments.forEach((seg) => {
        if (seg.duration > max) {
          max = seg.duration;
        }
      });
      return max;
    }
    function printableCues(cues) {
      const result = [];
      cues.forEach((cue) => {
        result.push(printableCue(cue));
      });
      return result.join("\n\n");
    }
    function printableCue(cue) {
      const printable = [];
      if (cue.identifier) {
        printable.push(cue.identifier);
      }
      const start = printableTimestamp(cue.start);
      const end = printableTimestamp(cue.end);
      const styles = cue.styles ? `${cue.styles}` : "";
      printable.push(`${start} --> ${end} ${styles}`);
      printable.push(cue.text);
      return printable.join("\n");
    }
    function printableTimestamp(timestamp) {
      const ms = (timestamp % 1).toFixed(3);
      timestamp = Math.round(timestamp - ms);
      const hours = Math.floor(timestamp / 3600);
      const mins = Math.floor((timestamp - hours * 3600) / 60);
      const secs = timestamp - hours * 3600 - mins * 60;
      const hourString = `${pad(hours, 2)}:`;
      return `${hourString}${pad(mins, 2)}:${pad(secs, 2)}.${pad(ms * 1e3, 3)}`;
    }
    module2.exports = { hlsSegment, hlsSegmentPlaylist };
  }
});

// node_modules/node-webvtt/index.js
var require_node_webvtt = __commonJS({
  "node_modules/node-webvtt/index.js"(exports, module2) {
    "use strict";
    var parse2 = require_parser().parse;
    var compile = require_compiler().compile;
    var segment = require_segmenter().segment;
    var hls = require_hls();
    module2.exports = { parse: parse2, compile, segment, hls };
  }
});

// main.ts
__export(exports, {
  default: () => ChatViewPlugin
});
var import_obsidian = __toModule(require("obsidian"));
var webvtt = __toModule(require_node_webvtt());
var KEYMAP = { ">": "right", "<": "left", "^": "center" };
var CONFIGS = {
  "header": ["h2", "h3", "h4", "h5", "h6"],
  "mw": ["50", "55", "60", "65", "70", "75", "80", "85", "90"],
  "mode": ["default", "minimal"]
};
var COLORS = [
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "purple",
  "grey",
  "brown",
  "indigo",
  "teal",
  "pink",
  "slate",
  "wood"
];
var _ChatPatterns = class {
};
var ChatPatterns = _ChatPatterns;
ChatPatterns.message = /(^>|<|\^)/;
ChatPatterns.delimiter = /.../;
ChatPatterns.comment = /^#/;
ChatPatterns.colors = /\[(.+?)\]/;
ChatPatterns.format = /{(.+?)}/;
ChatPatterns.joined = RegExp([_ChatPatterns.message, _ChatPatterns.delimiter, _ChatPatterns.colors, _ChatPatterns.comment, _ChatPatterns.format].map((pattern) => pattern.source).join("|"));
ChatPatterns.voice = /<v\s+([^>]+)>([^<]+)<\/v>/;
var _TranscriptPatterns = class {
};
var TranscriptPatterns = _TranscriptPatterns;
TranscriptPatterns.message = /^(\(.+?\)|\[.+?\])(.+?)$/;
TranscriptPatterns.specialComment = /^\*\*\*(.+?)\*\*\*$/;
TranscriptPatterns.subtext = /^(\(.+?\)|\[.+?\])/;
TranscriptPatterns.format = /{(.+?)}/;
TranscriptPatterns.colors = /^\[(.+?)\]$/;
TranscriptPatterns.align = /^>(.+?)(?:,|$)$/;
TranscriptPatterns.configs = RegExp([_TranscriptPatterns.format, _TranscriptPatterns.colors, _TranscriptPatterns.align].map((pattern) => pattern.source).join("|"));
var ChatViewPlugin = class extends import_obsidian.Plugin {
  onload() {
    return __async(this, null, function* () {
      this.registerMarkdownCodeBlockProcessor("chat-transcript", (source, el, context) => {
        const lines = source.split("\n").map((val) => val.trim());
        const formats = new Map();
        const colors = new Map();
        const rightAlignHeaders = [];
        for (const line of lines) {
          if (TranscriptPatterns.format.test(line)) {
            const configs = line.replace("{", "").replace("}", "").split(",").map((l) => l.trim());
            for (const config of configs) {
              const [k, v] = config.split("=").map((c) => c.trim());
              if (Object.keys(CONFIGS).includes(k) && CONFIGS[k].includes(v))
                formats.set(k, v);
            }
          } else if (TranscriptPatterns.colors.test(line)) {
            const configs = line.replace("[", "").replace("]", "").split(",").map((l) => l.trim());
            for (const config of configs) {
              const [k, v] = config.split("=").map((c) => c.trim());
              if (k.length > 0 && COLORS.includes(v))
                colors.set(k, v);
            }
          } else if (TranscriptPatterns.align.test(line)) {
            rightAlignHeaders.push(...line.substring(1).split(",").map((val) => val.trim()));
          }
        }
        for (let index = 0; index < lines.length; index++) {
          const line = lines[index].trim();
          if (TranscriptPatterns.message.test(line)) {
            const subtext = line.match(TranscriptPatterns.subtext)[0].replace(/\(|\)|\[|\]/g, "");
            const main = line.substring(subtext.length + 2).trim().split(":");
            if (main.length === 1 && TranscriptPatterns.specialComment.test(main[0])) {
              el.createEl("p", { text: main[0].replace(/\*/g, "").trim(), cls: ["chat-view-comment"] });
            } else {
              const header = main.length === 1 ? "" : main[0];
              const body = main.length === 1 ? main[0] : main[1];
              let prev = "";
              const prevLine = lines[index - 1 < 0 ? 0 : index - 1].trim();
              if (TranscriptPatterns.message.test(prevLine)) {
                const prevSubtext = prevLine.match(TranscriptPatterns.subtext)[0];
                const prevMain = prevLine.substring(prevSubtext.length).trim().split(":");
                prev = prevMain.length === 1 ? "" : main[0];
              }
              const align = rightAlignHeaders.includes(header) ? "right" : "left";
              const continued = prev === header || header === "";
              this.createChatBubble(header, prev, body, subtext, align, el, continued, colors, formats, context.sourcePath);
            }
          } else if (line === "...") {
            const delimiter = el.createDiv({ cls: ["delimiter"] });
            for (let i = 0; i < 3; i++)
              delimiter.createDiv({ cls: ["dot"] });
          } else if (!TranscriptPatterns.configs.test(line)) {
            el.createEl("p", { text: line, cls: ["chat-view-comment"] });
          }
        }
      });
      this.registerMarkdownCodeBlockProcessor("chat-webvtt", (source, el, context) => {
        const vtt = webvtt.parse(source, { meta: true });
        const messages = [];
        const self = vtt.meta && "Self" in vtt.meta ? vtt.meta.Self : void 0;
        const selves = self ? self.split(",").map((val) => val.trim()) : void 0;
        const formatConfigs = new Map();
        const maxWidth = vtt.meta && "MaxWidth" in vtt.meta ? vtt.meta.MaxWidth : void 0;
        const headerConfig = vtt.meta && "Header" in vtt.meta ? vtt.meta.Header : void 0;
        const modeConfig = vtt.meta && "Mode" in vtt.meta ? vtt.meta.Mode : void 0;
        if (CONFIGS["mw"].includes(maxWidth))
          formatConfigs.set("mw", maxWidth);
        if (CONFIGS["header"].includes(headerConfig))
          formatConfigs.set("header", headerConfig);
        if (CONFIGS["mode"].includes(modeConfig))
          formatConfigs.set("mode", modeConfig);
        console.log(formatConfigs);
        for (let index = 0; index < vtt.cues.length; index++) {
          const cue = vtt.cues[index];
          const start = (0, import_obsidian.moment)(Math.round(cue.start * 1e3)).format("HH:mm:ss.SSS");
          const end = (0, import_obsidian.moment)(Math.round(cue.end * 1e3)).format("HH:mm:ss.SSS");
          if (ChatPatterns.voice.test(cue.text)) {
            const matches = cue.text.match(ChatPatterns.voice);
            messages.push({ header: matches[1], body: matches[2], subtext: `${start} to ${end}` });
          } else {
            messages.push({ header: "", body: cue.text, subtext: `${start} to ${end}` });
          }
        }
        const headers = messages.map((message) => message.header);
        const uniqueHeaders = new Set(headers);
        uniqueHeaders.delete("");
        console.log(messages);
        console.log(uniqueHeaders);
        const colorConfigs = new Map();
        Array.from(uniqueHeaders).forEach((h, i) => colorConfigs.set(h, COLORS[i % COLORS.length]));
        console.log(colorConfigs);
        messages.forEach((message, index, arr) => {
          const prevHeader = index > 0 ? arr[index - 1].header : "";
          const align = selves && selves.includes(message.header) ? "right" : "left";
          const continued = message.header === prevHeader;
          this.createChatBubble(continued ? "" : message.header, prevHeader, message.body, message.subtext, align, el, continued, colorConfigs, formatConfigs, context.sourcePath);
        });
      });
      this.registerMarkdownCodeBlockProcessor("chat", (source, el, context) => {
        const rawLines = source.split("\n").filter((line) => ChatPatterns.joined.test(line.trim()));
        const lines = rawLines.map((rawLine) => rawLine.trim());
        const formats = new Map();
        const colors = new Map();
        for (const line of lines) {
          if (ChatPatterns.format.test(line)) {
            const configs = line.replace("{", "").replace("}", "").split(",").map((l) => l.trim());
            for (const config of configs) {
              const [k, v] = config.split("=").map((c) => c.trim());
              if (Object.keys(CONFIGS).includes(k) && CONFIGS[k].includes(v))
                formats.set(k, v);
            }
          } else if (ChatPatterns.colors.test(line)) {
            const configs = line.replace("[", "").replace("]", "").split(",").map((l) => l.trim());
            for (const config of configs) {
              const [k, v] = config.split("=").map((c) => c.trim());
              if (k.length > 0 && COLORS.includes(v))
                colors.set(k, v);
            }
          }
        }
        let continuedCount = 0;
        for (let index = 0; index < lines.length; index++) {
          const line = lines[index].trim();
          if (ChatPatterns.comment.test(line)) {
            el.createEl("p", { text: line.substring(1).trim(), cls: ["chat-view-comment"] });
          } else if (line === "...") {
            const delimiter = el.createDiv({ cls: ["delimiter"] });
            for (let i = 0; i < 3; i++)
              delimiter.createDiv({ cls: ["dot"] });
          } else if (ChatPatterns.message.test(line)) {
            const components = line.substring(1).replaceAll("\\|", "#%&#").split("|").map((value) => {
              return value.replaceAll("#%&#", "|").trim();
            });
            if (components.length > 0) {
              const first = components[0];
              const head = components.length > 1 ? first.trim() : "";
              const msg = components.length > 1 ? components[1].trim() : first.trim();
              const sub = components.length > 2 ? components[2].trim() : "";
              const cont = index > 0 && line.charAt(0) === lines[index - 1].charAt(0) && head === "";
              let prev = "";
              if (cont) {
                continuedCount++;
                const prevComponents = lines[index - continuedCount].trim().substring(1).split("|");
                prev = prevComponents[0].length > 1 ? prevComponents[0].trim() : "";
              } else {
                continuedCount = 0;
              }
              this.createChatBubble(head, prev, msg, sub, KEYMAP[line.charAt(0)], el, cont, colors, formats, context.sourcePath);
            }
          }
        }
      });
    });
  }
  createChatBubble(header, prevHeader, message, subtext, align, element, continued, colorConfigs, formatConfigs, sourcePath) {
    const marginClass = continued ? "chat-view-small-vertical-margin" : "chat-view-default-vertical-margin";
    const colorConfigClass = `chat-view-${colorConfigs.get(continued ? prevHeader : header)}`;
    const widthClass = formatConfigs.has("mw") ? `chat-view-max-width-${formatConfigs.get("mw")}` : import_obsidian.Platform.isMobile ? "chat-view-mobile-width" : "chat-view-desktop-width";
    const modeClass = `chat-view-bubble-mode-${formatConfigs.has("mode") ? formatConfigs.get("mode") : "default"}`;
    const headerEl = formatConfigs.has("header") ? formatConfigs.get("header") : "h4";
    const bubble = element.createDiv({
      cls: ["chat-view-bubble", `chat-view-align-${align}`, marginClass, colorConfigClass, widthClass, modeClass]
    });
    if (header.length > 0)
      bubble.createEl(headerEl, { text: header, cls: ["chat-view-header"] });
    if (message.length > 0) {
      import_obsidian.MarkdownRenderer.renderMarkdown(message, bubble, sourcePath, null);
      const paras = bubble.getElementsByTagName("p");
      for (let index = 0; index < paras.length; index++) {
        paras[index].className = "chat-view-message";
      }
    }
    if (subtext.length > 0)
      bubble.createEl("sub", { text: subtext, cls: ["chat-view-subtext"] });
  }
};

/* nosourcemap */