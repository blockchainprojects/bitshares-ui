import alt from "alt-instance";

class LogsActions {
    setLog(log) {
        return this.getLogs().then(data => {
            let logs = data || [];

            if (logs.length == 20) {
                logs.splice(0, 1);
            }

            logs.push(log);

            localStorage.setItem("logs", JSON.stringify(logs));
        });
    }

    getLogs() {
        return new Promise(resolve => {
            resolve(JSON.parse(localStorage.getItem("logs")));
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
