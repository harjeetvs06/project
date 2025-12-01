package boundedbuffer;

class buffer{
    int MS;
    int[] q;
    int fr,re,si;
public buffer(int s){
    MS=s;
    fr=0;
    re=-1;
    si=0; 
    q=new int[MS];
}
public synchronized void insert(int ch){
    try{
        while (si==MS) {
           wait(); 
            
        }
        re=(re+1)%MS;
        q[re]=ch;
        si++;
        notifyAll();
    }
    catch(InterruptedException e)
    {
        e.printStackTrace();
    }
}
public synchronized int delete(){
    int ch=0;
    try{
        while(si==0){
            wait();
        }
        ch=q[fr];
        fr=(fr+1)%MS;
        si--;
        notifyAll();

    }
    catch(InterruptedException e){
        e.printStackTrace();
    }
    return ch;
}
}
class consumer extends Thread{
    buffer b;
    public consumer(buffer a){
        b=a;
    }
    public void run()
    {
        while(!Thread.currentThread().isInterrupted()){
            int c=b.delete();
            System.out.println(c);
        }
    }
}
class producer extends Thread  {
    buffer b1;
    public producer(buffer a){
        b1=a;
    }
    public void run()
    {
        for(int c=0;c<10;c++)
            b1.insert(c);
    }

}
public class boundedbuffer {
    public static void main(String[] args) {
        buffer Q=new buffer(5);
        producer p=new producer(Q);
        consumer c=new consumer(Q);
        p.start();
        c.start();
        try{
            p.join();
            c.interrupt();
        }
        catch(InterruptedException e){
            e.printStackTrace();
        }
    }
    
}
