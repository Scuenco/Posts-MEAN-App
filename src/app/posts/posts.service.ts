import {Post} from './post.model';
import { Injectable } from '@angular/core';
import { Subject} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

const BACKEND_URL = environment.apiUrl + '/posts/';

// @Injectable will create one instance of the service for the entire app
@Injectable({providedIn: 'root'})
export class PostsService {

  // "private": can't edit it from outside
  private posts: Post [] = [];
  private postsUpdated = new Subject<{posts: Post[], postCount: number}>(); // similar to: new EventEmitter();

  constructor(private httpClient: HttpClient, private router: Router) {}

  getPosts( postsPerPage: number, currentPage: number ) {
    const queryParams = `?pageSize=${postsPerPage}&page=${currentPage}`;
    this.httpClient
      .get<{message: string, posts: any, maxPosts: number}>( BACKEND_URL + queryParams)
      .pipe(map(postData => {
        return {
          posts: postData.posts.map( mappedData => {
            return {
              title: mappedData.title,
              content: mappedData.content,
              id: mappedData._id,
              imagePath: mappedData.imagePath,
              creator: mappedData.creator
            };
          }),
          maxPosts: postData.maxPosts};
      } ))
      .subscribe((transformedPostData) => {
        this.posts = transformedPostData.posts;
        this.postsUpdated.next({
          posts: [...this.posts],
          postCount: transformedPostData.maxPosts });
      });
  }
  // Returns an object which we can now listen to but not emit
  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  getPost(id: string) {
    return this.httpClient.get<{_id: string, title: string,
      content: string,
      imagePath: string,
      creator: string
    }> (BACKEND_URL + id);
  }

  addPost(title: string, content: string, image: File ) {
    // const post: Post = {id: null, title, content};
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);

    // this.httpClient.post<{ message: string, postId: string }>
    this.httpClient.post<{ message: string, post: Post }>
      (BACKEND_URL, postData)
    .subscribe(responseData => {
      this.router.navigate(['/']);
    });
  }
  updatePost(id: string, title: string, content: string, image: File | string) {
    // const post: Post = {id, title, content, imagePath: null};
    let postData: Post | FormData;
    if (typeof(image) === 'object') {
      // create a form data object
      postData = new FormData();
      postData.append('id', id),
      postData.append('title', title),
      postData.append('content', content),
      postData.append('image', image, title)
    } else {
      // send normal JSON data
      postData = { id, title, content,
        imagePath: image,
        creator: null
       };
    }
    this.httpClient.put(BACKEND_URL + id, postData )
    .subscribe((responseData) => {
      // Navigate back to main page
      this.router.navigate(['/']);
    });
  }
  deletePost(postId: string) {
    return this.httpClient.delete(BACKEND_URL + postId);
  }
}
