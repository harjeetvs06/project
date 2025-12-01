#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_SIZE 5

struct student {
    char usn[10], name[10];
    struct student *next;
};
typedef struct student node;

node* getnode() {
    node *nn = (node*)malloc(sizeof(node));
    printf("Enter USN: ");
    scanf("%s", nn->usn);
    printf("Enter Name: ");
    scanf("%s", nn->name);
    nn->next = NULL;
    return nn;
}

int countnode(node *head) {
    int c = 0;
    while (head != NULL) {
        c++;
        head = head->next;
    }
    return c;
}

node* insertfront(node *head) {
    if (countnode(head) == MAX_SIZE) {
        printf("List full, cannot insert.\n");
        return head;
    }
    node *nn = getnode();
    nn->next = head;
    return nn;
}

node* insertrear(node *head) {
    if (countnode(head) == MAX_SIZE) {
        printf("List full, cannot insert.\n");
        return head;
    }
    node *nn = getnode();
    if (head == NULL) return nn;

    node *p = head;
    while (p->next != NULL) p = p->next;
    p->next = nn;
    return head;
}

node* deletefront(node *head) {
    if (head == NULL) {
        printf("List empty.\n");
        return head;
    }
    node *temp = head;
    head = head->next;
    free(temp);
    return head;
}

node* deleterear(node *head) {
    if (head == NULL) {
        printf("List empty.\n");
        return head;
    }
    if (head->next == NULL) {
        free(head);
        return NULL;
    }
    node *p = head;
    while (p->next->next != NULL)
        p = p->next;

    free(p->next);
    p->next = NULL;
    return head;
}

void display(node *head) {
    if (head == NULL) {
        printf("No data.\n");
        return;
    }
    printf("Name\tUSN\n");
    while (head != NULL) {
        printf("%s\t%s\n", head->name, head->usn);
        head = head->next;
    }
}

int main() {
    node *head = NULL;
    int ch, n, i;

    do {
        printf("\n1. Create\n2. Display\n3. Insert Front\n4. Insert Rear\n5. Delete Front\n6. Delete Rear\n");
        scanf("%d", &ch);

        switch (ch) {
            case 1:
                printf("Enter number of students: ");
                scanf("%d", &n);
                for (i = 0; i < n; i++)
                    head = insertrear(head);
                break;

            case 2:
                display(head);
                break;

            case 3:
                head = insertfront(head);
                break;

            case 4:
                head = insertrear(head);
                break;

            case 5:
                head = deletefront(head);
                break;

            case 6:
                head = deleterear(head);
                break;
        }
    } while (ch >= 1 && ch <= 6);

    return 0;
}

