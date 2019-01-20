import { Injectable } from '@angular/core';
import {LogLevel} from './globals';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment'; 

@Injectable({
  providedIn: 'root'
})

export class LoggerService {
  entryDate: Date = new Date();
  message: string = "";
  level: LogLevel = environment.level;
  extraInfo: any[] = [];
  logWithDate: boolean = true;
  server = environment.server;
  
  constructor(private http: HttpClient) {};

  debug(filename:string,msg: string,user: string,ts:string) {
    if (this.level<=LogLevel.Debug){
    var obj={};
    obj["msg"] = msg; 
    obj["timestamp"] = ts;    
    obj["user"] = user;
    obj["pageDetail"] = filename;  
    obj["type"] = "DEBUG";  
    obj["delimiter"] = environment.delimiter;
    this.http.post('http://'+this.server+'/debug.php', JSON.stringify(obj), {
      responseType: 'text'
    }).map(response => {      

    }).subscribe(response => {      
    });
    }
  }
        
  info(filename:string, msg: string,user: string,ts:string) {
    if (this.level<=LogLevel.Info){
    var obj={};
    obj["msg"] = msg; 
    obj["timestamp"] = ts;    
    obj["user"] = user;
    obj["pageDetail"] = filename;  
    obj["type"] = "INFO";  
    obj["delimiter"] = environment.delimiter;

    this.http.post('http://'+this.server+'/debug.php', JSON.stringify(obj), {
      responseType: 'text'
    }).map(response => {      

    }).subscribe(response => {      
    });
    }
  }
        
  warn(filename:string,msg: string,user: string,ts:string) {
    if (this.level<=LogLevel.Warn){
    var obj={};
    obj["msg"] = msg;     
    obj["timestamp"] = ts;    
    obj["user"] = user;
    obj["pageDetail"] = filename;  
    obj["type"] = "WARNING";  
    obj["delimiter"] = environment.delimiter;

    this.http.post('http://'+this.server+'/debug.php', JSON.stringify(obj), {
      responseType: 'text'
    }).map(response => {      

    }).subscribe(response => {      
    });
    }
  }
        
  error(filename:string, msg: string,user: string,ts:string) {
    if (this.level<=LogLevel.Error){
    var obj={};
    obj["msg"] = msg;    
    obj["timestamp"] = ts;    
    obj["user"] = user;
    obj["pageDetail"] = filename;  
    obj["type"] = "ERROR";  
    obj["delimiter"] = environment.delimiter;

    this.http.post('http://'+this.server+'/debug.php', JSON.stringify(obj), {
      responseType: 'text'
    }).map(response => {      

    }).subscribe(response => {      
    });
    }
  }
        
  fatal(msg: string, ...optionalParams: any[]) {
    this.writeToLog(msg, LogLevel.Fatal,
                    optionalParams);
  }

  log(op: string, entity: string, ts: string, name: string, status: string, isSuper:boolean, user:string, role:string, pageDetail:string,orgName:string) {
    var obj={};
    obj["operation"] = op;
    obj["entity"] = entity;
    obj["value"] = name;
    obj["timestamp"] = ts;
    obj["status"] = status;
    obj["isSuper"] = isSuper;
    obj["user"] = user;
    obj["role"] = role;
    obj["pageDetail"] = pageDetail;
    obj["orgName"] = orgName;
    obj["delimiter"] = environment.delimiter;

    this.http.post('http://'+this.server+'/logging.php', JSON.stringify(obj), {
      responseType: 'text'
    }).map(response => {      

    }).subscribe(response => {      
    });

  }
  
  private writeToLog(msg: string,level: LogLevel,params: any[]) {        

  }    
}