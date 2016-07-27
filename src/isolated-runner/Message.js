"use strict";
(function (MessageType) {
    MessageType[MessageType["Start"] = 0] = "Start";
    MessageType[MessageType["Init"] = 1] = "Init";
    MessageType[MessageType["InitDone"] = 2] = "InitDone";
    MessageType[MessageType["Run"] = 3] = "Run";
    MessageType[MessageType["Result"] = 4] = "Result";
    MessageType[MessageType["Dispose"] = 5] = "Dispose";
    MessageType[MessageType["DisposeDone"] = 6] = "DisposeDone";
})(exports.MessageType || (exports.MessageType = {}));
var MessageType = exports.MessageType;
//# sourceMappingURL=Message.js.map