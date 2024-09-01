class Block{
    constructor(p,start,end,type){
        this.processName = p.name;
        this.start = start;
        this.end = end;
        this.type = type;
    }
}
class Process{
    constructor(pid,name,at,bt,pr=0){
        this.pid = pid;
        this.name = name;
        this.at = at;
        this.bt = bt;
        this.ct = 0;
        this.tt = 0;
        this.wt = 0;
        this.remain = bt;
        this.type = 'process';
        this.pr = pr;
    }
}

class Gantt{
    constructor(){
        this.blocks = [];
    }
    addBlock(p,start,end,type="process"){
        if(this.blocks.length == 0){
            this.blocks.push(new Block(p,start,end,type));
        }else{
            if(this.blocks[this.blocks.length-1].end == start){
                this.blocks.push(new Block(p,start,end,type));}
                else{
            throw new Error('Invalid block time doesnt match with previous block end time');
            }
        }
    }
    getBlocks(){
        return this.blocks;
    }
    reset(){
        this.blocks = [];
    }
}

class CPU{
    constructor(){
        this.time = 0;
        this.process = null;        
        this.chart = new Gantt();
    }
    run(p,time){
        this.process = p;
        if(p.remain >= time){
            this.chart.addBlock(p, this.time, this.time+time);
            this.time += time;
            p.remain -= time;
        }else{
            this.chart.addBlock(p, this.time, this.time+p.remain);
            this.time += p.remain;
            p.remain = 0;
        }
        return p;
    }
    idealTill(t){
        this.process = null;
        this.chart.addBlock("null",this.time,t,"ideal");
        this.time = t;
    }
    overhead(oh){
        this.chart.addBlock("null",this.time,this.time+oh,"overhead");
        this.time += oh;
    }
    reset(){
        this.time = 0;
        this.process = null;
        this.chart.reset();
    }
}

class scheduler{
    constructor(){
        this.cpu = new CPU();
        this.qauntum = 500;
        this.overhead = 0;
        this.ready = [];
        this.process = [];
        this.completed = [];
        this.total = 0;
        this.bps = [];
        this.curBP = 1;
    }
    setQauntum(q){
        this.qauntum = q;
    }
    setOverhead(oh){
        this.overhead = oh;
    }
    addProcess(name,at,bt,pr,pid){
        this.process.push(new Process(pid,name,at,bt,pr));
    }
    removeProcess(p){
        this.process = this.process.filter(e=>e!=p);
    }
    reset(){
        this.qauntum = 500;
        this.overhead = 0;
        this.ready = [];
        this.process = [];
        this.completed = [];
        this.total = 0;
        this.cpu.reset();
    }
    sortByArrival(){
        this.process.sort((a,b)=>a.at-b.at);
    }
    sortByBTAponAT(till){
        return this.ready.filter(p=>p.at<=till).sort((a,b)=>a.bt-b.bt);
    }
    sortByPriorityAponAT(till){
        return this.ready.filter(p=>p.at<=till).sort((a,b)=>a.pr-b.pr);
    }
    sortReadyByPriority(){
        this.ready.sort((a,b)=>a.pr-b.pr);
    }
    sortReadyByBT(){
        this.ready.sort((a,b)=>a.bt-b.bt);
    }
    sortReadyByAT(){
        this.ready.sort((a,b)=>a.at-b.at);
    }
    simulate(){
        this.sortByArrival();
        this.process.forEach(e=>{
            if(!this.bps.includes(e.at)){

                this.bps.push(e.at);
            }
        })
        console.log(this.bps)
        while(this.ready.length > 0 || this.process.length > 0){

            if(this.ready.length == 0){
                this.ready.push(this.process.shift());
                let temp = this.ready[0];
                let sameTime = this.process.filter(e=>e.at == temp.at);
                if(sameTime.length > 0){
                    sameTime.forEach(e=>{
                        this.ready.push(e);
                        this.removeProcess(e);
                    });
                }
            }

            this.ready.sort((a,b)=>a.pr - b.pr);
            let top = this.ready.shift();
            if(top.at>this.cpu.time){
                this.cpu.idealTill(top.at);
            }
            let allowedTime;
            if(this.curBP == this.bps.length){
                allowedTime = top.remain;
            }else{
                 allowedTime =  (this.bps[this.curBP] - this.bps[this.curBP-1]);
                 this.curBP++;
            }

            console.log(allowedTime, "Allowed Time",top.name);
            if(this.cpu.process != null && this.cpu.process != top){this.cpu.overhead(this.overhead);}
            let exProcess = this.cpu.run(top,allowedTime);
            
            for(let i =0; i<this.process.length;i++){
                if(this.process[i].at <= this.cpu.time){
                    this.ready.push(this.process[i]);
                    this.process.splice(i,1);
                    i--;
                }
            }

            if(exProcess.remain == 0){
                exProcess.ct = this.cpu.time;
                exProcess.tt = exProcess.ct - exProcess.at;
                exProcess.wt = exProcess.tt - exProcess.bt;
                this.completed.push(exProcess);
            }else if(exProcess.remain > 0){
                this.ready.push(exProcess);
            }
        }
    }
    getCompleted(){
        return this.completed;
    }
    getAvgTT(){
        return this.completed.reduce((acc,cur)=>acc+cur.tt,0)/this.completed.length;
    }
    getAvgWT(){
        return this.completed.reduce((acc,cur)=>acc+cur.wt,0)/this.completed.length;
    }
    getGantt(){
        return this.cpu.chart;
    }
}
let s = new scheduler(2);
s.setQauntum(2);
s.setOverhead(0);
s.addProcess('p1',0,3,3);
s.addProcess('p2',1,4,2);
s.addProcess('p3',2,6,4);
s.addProcess('p4',3,4,6);
s.addProcess('p5',5,2,10);
s.simulate();
console.log(s.completed);
s.getCompleted().forEach(e=>console.log(e.name,"Completion time:" + e.ct,",turn around time: " + e.tt, "Waiting time: " + e.wt));//completed process output
console.log(s.getGantt().getBlocks().map(e=>e.processName));