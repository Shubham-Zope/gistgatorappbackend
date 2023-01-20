from flask import *
from flask_cors import CORS, cross_origin
app=Flask(__name__)
from transformers import BartTokenizer, AutoModelForSeq2SeqLM
import torch
import re
import csv
import io
import docx

CORS(app)


def getText(filename):
    doc = docx.Document(filename)
    fullText = []
    for para in doc.paragraphs:
        fullText.append(para.text)
    return '\n'.join(fullText)

ss = "Summary"
transfilename = ""

@app.route('/')
def home():
    return render_template("index.html", ss=1)

@app.route('/uploadtranscript', methods=['POST'])
@cross_origin()
def uploadtranscript():
    # print(request.files)
    if request.method == 'POST':
        im_dict_file = request.files
        global ss
        ss = str(im_dict_file.get('file').read(), 'UTF-8')
        im_dict = request.form 
        # print(request.form)
        print(im_dict.get('fileName'))
        data = {
            'transcript': "File Posted Successfully"
        }
        return jsonify(data)


def processentry(entry):
    a = []
    for row in entry:
        for i in row.split('\t'):
            a.append(i)
    # print(a)
    jt=a[1]+a[2]
    lt = a[3]+a[4]
    resarray = a[0:1]+[jt]+[lt]+a[5:]
    return resarray
    


@app.route("/uploadattendancereport", methods=['POST'])
@cross_origin()
def uploadattendancereport():
    
    f = request.files['reportToUpload']  
    fstring = f.read().decode("utf-16")
    li=[]
    meetinginfo = fstring.split('\n')[:6]
    di={}
    for r in meetinginfo[1:]:
        ts=r.split('\t')
        di[ts[0]]=ts[1]
    li.append(di)

    
    normalcsv = fstring.split('\n')[7:]
    f=csv.reader(normalcsv, skipinitialspace=True)
    for row in f:
        header=row[0].split('\t')
        break
  

    for row in f:
        if len(row) != 0:
            entry=processentry(row)
            res = dict(zip(header, entry))
            li.append(res)
    data = {
            'attendanceReport': li
        }
    return jsonify(data) 


@app.route("/getsummary", methods=['GET'])
@cross_origin()
def getsummary():
    if request.method == 'GET' and ss != "Summary":
        finaltrans = ss
        print(f"Final trans {finaltrans}")
        print("Transcription Started")
        tokenizer_2 = BartTokenizer.from_pretrained("knkarthick/MEETING-SUMMARY-BART-LARGE-XSUM-SAMSUM-DIALOGSUM-AMI")
        model_2 = AutoModelForSeq2SeqLM.from_pretrained("knkarthick/MEETING-SUMMARY-BART-LARGE-XSUM-SAMSUM-DIALOGSUM-AMI")
        # summarizer = pipeline("summarization", model="Salesforce/bart-large-xsum-samsum")
        # txt = re.sub(r'[^.\w\s]', '', "".join(finaltrans))
        inputs_no_trunc = tokenizer_2(finaltrans, max_length=None, return_tensors='pt', truncation=False)
        # get batches of tokens corresponding to the exact model_max_length
        print("Creating Batches")
        chunk_start = 0
        chunk_end = tokenizer_2.model_max_length # if (len(finaltrans.split()) > tokenizer_2.model_max_length) else int(len(finaltrans.split())/2) # == tokenizer_2.model_max_length for Bart
        inputs_batch_lst = []
        while chunk_start <= len(inputs_no_trunc['input_ids'][0]):
            inputs_batch = inputs_no_trunc['input_ids'][0][chunk_start:chunk_end]  # get batch of n tokens
            inputs_batch = torch.unsqueeze(inputs_batch, 0)
            inputs_batch_lst.append(inputs_batch)
            chunk_start += tokenizer_2.model_max_length# if (len(finaltrans.split()) > tokenizer_2.model_max_length) else int(len(finaltrans.split())/2)  # == tokenizer_2.model_max_length for Bart
            chunk_end += tokenizer_2.model_max_length# if (len(finaltrans.split()) > tokenizer_2.model_max_length) else int(len(finaltrans.split())/2)  # == tokenizer_2.model_max_length for Bart

        # generate a summary on each batch
        print("Summarization starting!!")
        summary_ids_lst = [model_2.generate(inputs, num_beams=4, max_length=100, early_stopping=True) for inputs in
                           inputs_batch_lst]

        # decode the output and join into one string with one paragraph per summary batch
        # global finalsummary
        summary_batch_lst = []
        for summary_id in summary_ids_lst:
            summary_batch = [tokenizer_2.decode(g, skip_special_tokens=True, clean_up_tokenization_spaces=False) for g in
                             summary_id]
            summary_batch_lst.append(summary_batch[0])
        finalsummary = '\n'.join(summary_batch_lst)
        print("Summarization Done!!!!!!")
        data = {
            "Summary": finalsummary
        }
        print(finalsummary)
        response = jsonify(data)
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,Origin,Accept,X-Requested-With')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        print(response.headers)
        return response
    else:
        data = {
            "Summary": 'Summary'
        }
        response = jsonify(data)
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,Origin,Accept,X-Requested-With')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        print(response.headers)
        return response




if __name__=='__main__':
    app.run(debug=True)