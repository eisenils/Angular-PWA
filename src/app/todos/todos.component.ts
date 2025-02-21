import { TodoService } from './../todo.service';
import { Component, OnInit } from '@angular/core';
import { Todo } from '../todo';
import { HttpClient } from '@angular/common/http';
import { SwPush } from '@angular/service-worker';
import { ShareService } from '../share.service';

@Component({
  selector: 'app-todos',
  templateUrl: './todos.component.html',
  styleUrls: ['./todos.component.css'],
})
export class TodosComponent implements OnInit {
  todos: Todo[] = [];
  constructor(
    private todoService: TodoService,
    private httpClient: HttpClient,
    private swPush: SwPush,
    public shareService: ShareService
  ) {}

  ngOnInit(): void {
    this.getAll();
  }

  async setDone(todo: Todo) {
    todo.done = !todo.done;
    await this.todoService.todos.put(todo);
    await this.getAll();
  }

  async requestPush() {
    const subscription = await this.swPush.requestSubscription({
      serverPublicKey:
        'BLI8zF79Z1kCQq72RgzYs0WtQ0ojY3XCqPwmgcNP-8LJIeXRep9sv6h41hErJDewrm3WDbFMPyyPhYO7-ClXabQ',
    });
    //Subscription ans Backend schicken
    await this.httpClient
      .post('http://localhost:3030/push', subscription)
      .toPromise();
  }

  async sync() {
    //Eigene Todos laden
    const todos = await this.todoService.getAll();
    //HTTP_Request an Server
    const todosFromServer = await this.httpClient
      .post<Todo[]>('http://localhost:3030/sync', todos)
      .toPromise();
    //Zusammenführung mit eigenen Todos
    await this.todoService.todos.bulkPut(todosFromServer);
    //Liste aktualisieren
    this.getAll();
  }

  async getAll() {
    this.todos = await this.todoService.getAll();
  }

  async add(title: string) {
    await this.todoService.add(title);
    this.getAll();
  }
}
