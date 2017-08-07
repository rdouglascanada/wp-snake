<?php
/*
Plugin Name: RDouglasCanada-WP-Snake
Description: A WordPress plugin that inserts an implementation of the Snake video game into a webpage when [SnakeGame] is in the page source.
Version: 1.0
Author: RDouglasCanada
*/

function rdouglascanada_InsertSnakeGame() {
	wp_enqueue_style('rdouglascanada-wp-snake-style',plugins_url().'/rdouglascanada-wp-snake/rdouglascanada-wp-snake.css');
	wp_enqueue_script('rdouglascanada-wp-snake-game',plugins_url().'/rdouglascanada-wp-snake/rdouglascanada-wp-snake-game-source-compressed.js');
	return '<canvas id="rdouglascanada-SnakeGameCanvas"></canvas>';
}
add_shortcode('SnakeGame','rdouglascanada_InsertSnakeGame');
?>