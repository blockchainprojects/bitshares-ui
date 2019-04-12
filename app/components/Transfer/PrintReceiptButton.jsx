import React from "react";
import {Tooltip, Button} from "bitshares-ui-style-guide";
import counterpart from "counterpart";
import jsPDF from "jspdf";
import "jspdf-autotable";

const printReceipt = ({data, parsePrice}) => {
    const {line_items, to, asset, from, total_amount, memo, currency} = data;
    const marginUp = 25,
        lineMargin = 5,
        marginLeft = 15,
        transactionDataright = 150,
        width = 210,
        rowHeight = 10,
        fontSize = 16,
        totalFontSize = 20;

    let height = 0;
    let body = [];

    const date = new Date().toLocaleDateString("en-US").replace(/\//g, ".");

    const pdf = new jsPDF({
        orientation: "portrait",
        compressPdf: true
    });

    pdf.setFontStyle("bold");
    pdf.setFontSize(fontSize);
    pdf.text("FROM", marginLeft, (height += marginUp));
    pdf.text(from, marginLeft, (height += rowHeight));

    pdf.autoTable({
        body: [
            ["", "RECEIPT #", memo],
            [
                {content: "BILL TO", styles: {fontStyle: "bold"}},
                "RECEIPT DATE",
                date
            ],
            [to, "TRANSACTION", memo]
        ],
        bodyStyles: {valign: "top"},
        styles: {cellWidth: "wrap", rowPageBreak: "auto", halign: "justify"},
        columnStyles: {
            0: {halign: "left", cellWidth: 90},
            1: {fontStyle: "bold"},
            2: {cellWidth: 40}
        },
        startY: (height += rowHeight),
        theme: "plain"
    });

    pdf.line(
        lineMargin,
        (height = pdf.autoTable.previous.finalY + rowHeight),
        width - lineMargin,
        height
    );

    pdf.setFontSize(totalFontSize);
    pdf.text("Receipt Total", marginLeft, (height += rowHeight));
    pdf.text(`${total_amount} ${currency}`, transactionDataright, height);
    pdf.line(lineMargin, (height += 5), width - lineMargin, height);

    pdf.setFontStyle("normal");
    pdf.setFontSize(fontSize);
    for (let item of line_items) {
        const price = parsePrice(item.price);
        const unit = `${price} ${asset}`;
        const total = `${item.quantity * price} ${asset}`;
        body = [
            ...body,
            {descrption: item.label, unit, amount: item.quantity, total}
        ];
    }
    pdf.autoTable({
        columns: [
            {
                header: {content: "DESCRIPTION", styles: {halign: "left"}},
                dataKey: "descrption"
            },
            {header: "AMOUNT", dataKey: "amount"},
            {header: "UNIT", dataKey: "unit"},
            {header: "TOTAL", dataKey: "total"}
        ],
        body: body,
        startY: height + rowHeight,
        bodyStyles: {valign: "top"},
        styles: {cellWidth: "auto", rowPageBreak: "auto", halign: "right"},
        columnStyles: {
            descrption: {halign: "left"}
        },
        theme: "plain"
    });
    pdf.save("bitshares-receipt" + to + ".pdf");
};
const PrintReceiptButton = ({data, parsePrice}) => {
    const tip = "tooltip.copy_tip",
        dataPlace = "left",
        buttonText = "Print receipt";
    return (
        <Tooltip placement={dataPlace} title={counterpart.translate(tip)}>
            <Button
                type="primary"
                icon="download"
                style={{float: "right", margin: "20px"}}
                disabled={false}
                onClick={() => printReceipt({data, parsePrice})}
            >
                {buttonText}
            </Button>
        </Tooltip>
    );
};

export default PrintReceiptButton;
