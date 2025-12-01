#include<stdio.h>
#include<stdlib.h>
#include<malloc.h>
#define MAX 5
int c;
struct student{
    char name[40],usn[19];
    int sem;    
    struct student *next;
};
typedef struct student node;

node *getnode(){
    node *nn;
    nn=(node *)malloc(sizeof(node));
    printf("enter the student details");
    printf("Name");
    scanf("%s",nn->name);
    printf("USN");
    scanf("%s",nn->usn);
    printf("sem");
    scanf("%d",&nn->sem);
    nn->next=NULL;
    return nn;
}

int countnode(node *head){
    node *p;
    p=head;
    c=0;
    while(p!=NULL){
        p=p->next;
        c++;
    }
    return c;
}
node *display(node *head){
    node *p;
    if(head==NULL){
    printf("no data");
    }
    else{
        p=head;
        printf("\nName\nUSN\nSem");
        while(p!=NULL){
            printf("%s\n%s\n%d\n",p->name,p->usn,p->sem);
            p=p->next;
        }
        printf("the count nodes %d",countnode(head));
    }
    return head;
}
node *create(node *head){
    node *nn;
    if(head==NULL){
        nn=getnode(head);
        head=nn;
    }
    else{
        nn=getnode();
        nn->next=head;
        head=nn;
    }
    return head;
}
node *insertfront(node *head){
    node *nn;
    if(countnode(head)==MAX){
        printf("list is overflowing");
    }
    else{
        nn=create(head);
        head=nn;
    }
    return head;
}
node *insertrear(node *head){
    node *nn,*p;
        if(countnode(head)==MAX){
        printf("list is overflowing");
    }
    else{
        p=head;
        if(head==NULL){
            nn=getnode(head);
        }
        while(p->next!=NULL){
        p=p->next;
        }
        nn=getnode();
        p->next=nn;

    }
    return head;
}
node *deletefront(node *head){
    node *p;
    if(head==NULL){
        printf("no data to be deleted");
    }
    else{
        p=head;
        head=head->next;
        free(p);
    }
    return head;
}
node *deleterear(node *head){
    node *p,*q;
    if(head==NULL){
        printf("no data to be deleted");
    }
    else if(countnode(head)==1){
        p=head;
        head=NULL;
        free(p);
    }
    else{
        while((p->next)->next!=NULL){
            p=p->next;
        }
        q=p->next;
        p->next=NULL;
        free(q);
    }
    return head;
}
void main(){
    int ch,n;
    node *head;
    head=NULL;
    do{
        printf("\n....student data....\n");

        printf("create \n display \n insertfront \n insertrear \n deletefront \n deleterear \n exit");
        scanf("%d",&ch);
        switch (ch)
        {
        case 1:printf("enter the number of students");
        scanf("%d",&n);
        for(int i=0;i<n;i++)
        head=create(head);
        break;

        case 2:head=display(head);
        break;

        case 3:head=insertfront(head);
        break;

        case 4:head=insertrear(head);
        break;

        case 5:deletefront(head);
        break;

        case 6:deleterear(head);
        break;

        
        default:
        printf("invalid choice");
        }
    }while(ch>=1&&ch<=6);
}
