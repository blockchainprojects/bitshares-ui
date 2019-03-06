import alt from "alt-instance";
import ls from "common/localStorage";

const STORAGE_KEY = "__graphene__";
let ss = new ls(STORAGE_KEY);

class LogsActions {
    async setLog(log) {
        return await ss.set("logs", JSON.stringify(log));
    }
    getLogs() {
        return new Promise(resolve => {
            resolve(JSON.parse(ss.get("logs", [])));
        });
    }

    convertToText(array) {
        return new Promise(resolve => {
            let textData = [];
            array.map(item => {
                let logData = [];
                item.log.map(log =>
                    logData.push(
                        typeof log == "string" ? log : JSON.stringify(log)
                    )
                );
                logData = logData.join(" ~ ");
                textData.push(`${item.type}: ${logData}`);
            });

            textData = textData.join("\n");
            resolve(textData);
        });
    }
}

export default alt.createActions(LogsActions);
