package producer;
class Q{
    int val;
    boolean flag=false;
    synchronized int get()
    {
        if(!flag)
            try{
        wait();
    }
    catch(InterruptedException e)
    {
        e.printStackTrace();
    }
    System.out.println("consumer consuming"+val);
    flag=false;
    notify();
    return val;
    }
        synchronized void put(int val)
    {
        if(flag)
            try{
        wait();
    }
    catch(InterruptedException e)
    {
        e.printStackTrace();
    }
    this.val=val;
    flag=true;
    System.out.println("producer producing"+val);
    notify();
    }
}
class producer extends Thread{
    Q obj;
    producer(Q t)
    {
        obj=t;
    }
    public void run(){
        for(int i=0;i<10;i++)
        {
            obj.put(i);
        }
    }
}
class consumer extends Thread{
    Q obj1;
    consumer(Q t)
    {
        obj1=t;
    }
    public void run(){
        for(int i=0;i<10;i++)
        {
            obj1.get();
        }
    }
}
public class PC {
    public static void main(String[] args) {
        Q q=new Q();
        producer p=new producer(q);
        consumer c=new consumer(q);
            p.start();
            c.start();
        
    }
    
}
