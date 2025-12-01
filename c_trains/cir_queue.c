#include<stdio.h>
#include<stdlib.h>
#define MAX 5
typedef struct {
    int front,rear;
    int items[MAX];
}
cqueue;
cqueue cq;
void cqinsert(float value)
    {
        if(cq.front==(cq.rear+1)%MAX)
        {
            printf("circular queue is full\n");
        }
        else{
            cq.rear=(cq.rear+1)%MAX;
            cq.items[cq.rear]=value;
        }
    }
    float cqdelete()
    {
        float value;
        if (cq.front==cq.rear){
            printf("circular queue is empty");
        }
        else{
            cq.front=(cq.front+1)%MAX;
            value=cq.items[cq.front];
            printf("the deleted element is \n");
            printf("%f",value);
        }
    }
    void cqdisplay()
    {
        int i;
        if (cq.front== cq.rear){
        printf("circular queue is empty");
        }
        else{
        for(i=cq.front+1;(cq.rear+1)%MAX!=(i)%MAX;i++){
            printf("%f",cq.items[i%MAX]);
        }
    }
}
void main(){
    cq.front=MAX-1;
    cq.rear=MAX-1;
    int ch;
    float m;
    while(1)
    {
        printf("");
        scanf("%d",ch);
        switch (ch)
        {
            case 1: printf("enter the element to be inserted");
            scanf("%f",&m);
            cqinsert(m);
            break;

            case 2:cqdelete();
            break;

            case 3:cqdisplay();
            break;

            case 4:exit(0);
            default:printf("Inavalid choice");
        }
    }
}





