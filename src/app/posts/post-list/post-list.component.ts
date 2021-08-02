import { Component, OnInit, OnDestroy } from '@angular/core';
import {Post} from '../post.model';
import { PostsService } from '../posts.service';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html'
})

export class PostListComponent implements OnInit, OnDestroy {
  // Adding @Input decorator, we can bind the property from the parent component.
  // @Input() posts: Post[] = [];

  posts: Post[] = [];
  isLoading = false;
  totalPosts = 0;
  postsPerPage = 2;
  currentPage = 1;
  pageSizeOptions =  [1, 2, 5, 10];
  userIsAuthenticated = false;
  userId: string; //
  private postsSub: Subscription;
  private authStatusSub: Subscription;

  constructor(public postService: PostsService, private authService: AuthService) {}

ngOnInit() {
  this.isLoading = true;
  this.postService.getPosts(this.postsPerPage, this.currentPage);
  this.userId = this.authService.getUserId(); //
  // setup a listener to that subject
  this.postsSub = this.postService.getPostUpdateListener()
    // the 1st arg is a function called whenever a new value is received.
    .subscribe((postData: {posts: Post[], postCount: number}) => {
      this.isLoading = false;
      this.totalPosts = postData.postCount;
      // update the posts with a new value received
      this.posts = postData.posts;
    });
  this.userIsAuthenticated =  this.authService.getIsAuth();
  this.authStatusSub = this.authService
    .getAuthStatusListener()
    .subscribe(isAuthenticated => {
      this.userIsAuthenticated = isAuthenticated;
      this.userId = this.authService.getUserId(); //
    });
}
// Called whenever the component is about to get removed.
ngOnDestroy() {
  // THis will remove the subscription and prevent memory leaks.
  this.postsSub.unsubscribe();
  this.authStatusSub.unsubscribe();
}
// pagination
onChangedPage(pageData: PageEvent) {
  this.isLoading = true;
  this.currentPage = pageData.pageIndex + 1;
  this.postsPerPage = pageData.pageSize;
  this.postService.getPosts(this.postsPerPage, this.currentPage);
}

onDelete(postid: string) {
  this.isLoading = true;
  this.postService.deletePost(postid).subscribe(() => {
    // to re-fetch new posts
    this.postService.getPosts(this.postsPerPage, this.currentPage);
  }, () => {
    this.isLoading = false;
  });
}
}
